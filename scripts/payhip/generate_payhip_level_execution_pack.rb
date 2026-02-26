#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "optparse"

ROOT = File.expand_path("../..", __dir__)
DEFAULT_BATCH_DIR = File.join(ROOT, "payhip/presale/upload-batches")
DEFAULT_TITLE_CLIPBOARD = File.join(DEFAULT_BATCH_DIR, "payhip-title-clipboard-all.csv")

INPUT_BY_LEVEL = {
  "l1" => File.join(DEFAULT_BATCH_DIR, "payhip-upload-batch-l1.csv"),
  "l2" => File.join(DEFAULT_BATCH_DIR, "payhip-upload-batch-l2.csv"),
  "l3" => File.join(DEFAULT_BATCH_DIR, "payhip-upload-batch-l3.csv"),
  "l4" => File.join(DEFAULT_BATCH_DIR, "payhip-upload-batch-l4.csv")
}.freeze

OPS_COLUMNS = [
  "sku",
  "listing_title",
  "final_title_en",
  "title_variant_used",
  "listing_title_short_en",
  "listing_title_mobile_en",
  "board_label",
  "tier_scope",
  "price_early_bird",
  "price_regular",
  "early_bird_end_date",
  "release_date",
  "main_cover_png",
  "image_folder",
  "subtitle_en",
  "short_description_en",
  "seo_title_en",
  "cta_label_en",
  "status_product_created",
  "status_9_images_uploaded",
  "status_copy_pasted",
  "status_seo_configured",
  "status_pricing_set",
  "status_published",
  "final_payhip_url",
  "published_at_utc",
  "notes"
].freeze

BACKFILL_COLUMNS = [
  "sku",
  "level",
  "board",
  "listing_title",
  "source_slug_candidate",
  "source_payhip_url_seed",
  "final_payhip_url",
  "update_target_file",
  "update_target_key_path",
  "status_backfilled",
  "status_verified_live",
  "notes"
].freeze

def read_csv(path)
  rows = []
  CSV.foreach(path, headers: true) { |row| rows << row.to_h }
  rows
end

def build_title_map(path)
  return {} unless File.exist?(path)

  map = {}
  read_csv(path).each do |row|
    sku = row.fetch("sku", "").to_s
    next if sku.empty?

    map[sku] = row
  end
  map
end

def write_csv(path, headers, rows)
  FileUtils.mkdir_p(File.dirname(path))
  CSV.open(path, "w", write_headers: true, headers: headers) do |csv|
    rows.each do |row|
      csv << headers.map { |h| row[h] }
    end
  end
end

def default_target_path(level, row)
  board = row.fetch("board", "")
  case level
  when "l1", "l2"
    "_data/kahoot_subtopic_links.json"
  when "l3", "l4"
    "_data/kahoot_presale_catalog.json"
  else
    "_data/kahoot_presale_catalog.json"
  end
end

def default_key_path(level, row)
  case level
  when "l1"
    "links[sku=#{row.fetch('sku', '')}].worksheet_payhip_url"
  when "l2"
    "links[sku=#{row.fetch('sku', '')}].section_bundle_payhip_url"
  when "l3"
    seed = row.fetch("payhip_url_seed", "")
    src = seed[/[?&]src=([^&]+)/, 1].to_s
    unit_key = src[/unit-([a-z0-9-]+)\z/, 1].to_s
    unit_key = row.fetch("slug_candidate", "").split("-").last if unit_key.empty?
    "boards.#{row.fetch('board', '')}.units[key=#{unit_key}].presale_url"
  when "l4"
    "boards.#{row.fetch('board', '')}.all_units_bundle.presale_url"
  else
    ""
  end
end

def write_checklist(path, level, rows)
  level_upper = level.upcase
  lines = []
  lines << "# #{level_upper} Upload Execution Checklist"
  lines << ""
  lines << "Use this checklist while creating/updating Payhip listings for `#{level_upper}`."
  lines << ""
  lines << "## Batch Summary"
  lines << ""
  lines << "- Level: `#{level_upper}`"
  lines << "- SKU count: `#{rows.length}`"
  lines << "- Input batch CSV: `payhip/presale/upload-batches/payhip-upload-batch-#{level}.csv`"
  lines << "- Ops sheet: `payhip/presale/upload-batches/#{level}/#{level}-ops-sheet.csv`"
  lines << "- URL backfill template: `payhip/presale/upload-batches/#{level}/#{level}-url-backfill-template.csv`"
  lines << ""
  lines << "## Per-SKU Required Steps"
  lines << ""
  lines << "1. Create/update Payhip product with `final_title_en`."
  lines << "2. Set price (`price_early_bird` + `price_regular`)."
  lines << "3. Paste description + subtitle + SEO fields."
  lines << "4. Upload 9 images (`main_cover_png` first, then 8 supporting images)."
  lines << "5. Publish product and paste `final_payhip_url` in ops sheet."
  lines << "6. Mark all status columns for that SKU."
  lines << ""
  lines << "## SKU Checklist"
  lines << ""

  rows.each_with_index do |row, i|
    lines << "### #{i + 1}. #{row.fetch('sku', '')} - #{row.fetch('listing_title', '')}"
    lines << ""
    lines << "- [ ] Product created/updated"
    lines << "- [ ] 9 images uploaded"
    lines << "- [ ] Copy pasted"
    lines << "- [ ] SEO configured"
    lines << "- [ ] Pricing confirmed: #{row.fetch('price_early_bird', '')} / #{row.fetch('price_regular', '')}"
    lines << "- [ ] Published"
    lines << "- [ ] Final URL captured"
    lines << "- Final title: `#{row.fetch('final_title_en', '')}`"
    lines << "- Title variant: `#{row.fetch('title_variant_used', '')}`"
    lines << "- Short title: `#{row.fetch('listing_title_short_en', '')}`"
    lines << "- Mobile title: `#{row.fetch('listing_title_mobile_en', '')}`"
    lines << "- Cover: `#{row.fetch('main_cover_png', '')}`"
    lines << "- Image folder: `#{row.fetch('image_folder', '')}`"
    lines << ""
  end

  lines << "## Completion Gate"
  lines << ""
  lines << "1. All SKU rows in ops sheet have `status_published = yes`."
  lines << "2. URL backfill template has `final_payhip_url` for every SKU."
  lines << "3. Backfill to data source completed and verified."
  lines << ""

  File.write(path, lines.join("\n") + "\n")
end

options = {
  level: "l3",
  batch_dir: DEFAULT_BATCH_DIR,
  title_clipboard: DEFAULT_TITLE_CLIPBOARD
}

OptionParser.new do |opts|
  opts.banner = "Usage: ruby scripts/payhip/generate_payhip_level_execution_pack.rb [options]"
  opts.on("--level LEVEL", "l1|l2|l3|l4 (default l3)") { |v| options[:level] = v.downcase }
  opts.on("--batch-dir PATH", "Batch CSV directory") { |v| options[:batch_dir] = v }
  opts.on("--title-clipboard PATH", "Clipboard title CSV (optional)") { |v| options[:title_clipboard] = v }
end.parse!

unless INPUT_BY_LEVEL.key?(options[:level])
  warn "Unsupported level: #{options[:level]} (expected l1|l2|l3|l4)"
  exit 1
end

batch_csv = File.join(options[:batch_dir], "payhip-upload-batch-#{options[:level]}.csv")
unless File.exist?(batch_csv)
  warn "Batch CSV not found: #{batch_csv}"
  exit 1
end

rows = read_csv(batch_csv)
if rows.empty?
  warn "No rows in batch CSV: #{batch_csv}"
  exit 1
end

title_map = build_title_map(options[:title_clipboard])

level_dir = File.join(options[:batch_dir], options[:level])
FileUtils.mkdir_p(level_dir)

ops_rows = rows.map do |row|
  title_row = title_map.fetch(row.fetch("sku", ""), {})
  {
    "sku" => row.fetch("sku", ""),
    "listing_title" => row.fetch("listing_title", ""),
    "final_title_en" => title_row.fetch("final_title_en", row.fetch("listing_title_short_en", "")),
    "title_variant_used" => title_row.fetch("title_variant_used", "short"),
    "listing_title_short_en" => row.fetch("listing_title_short_en", ""),
    "listing_title_mobile_en" => row.fetch("listing_title_mobile_en", ""),
    "board_label" => row.fetch("board_label", ""),
    "tier_scope" => row.fetch("tier_scope", ""),
    "price_early_bird" => row.fetch("price_early_bird", ""),
    "price_regular" => row.fetch("price_regular", ""),
    "early_bird_end_date" => row.fetch("early_bird_end_date", ""),
    "release_date" => row.fetch("release_date", ""),
    "main_cover_png" => row.fetch("main_cover_png", ""),
    "image_folder" => row.fetch("image_folder", ""),
    "subtitle_en" => row.fetch("subtitle_en", ""),
    "short_description_en" => row.fetch("short_description_en", ""),
    "seo_title_en" => row.fetch("seo_title_en", ""),
    "cta_label_en" => row.fetch("cta_label_en", ""),
    "status_product_created" => "",
    "status_9_images_uploaded" => "",
    "status_copy_pasted" => "",
    "status_seo_configured" => "",
    "status_pricing_set" => "",
    "status_published" => "",
    "final_payhip_url" => "",
    "published_at_utc" => "",
    "notes" => ""
  }
end

backfill_rows = rows.map do |row|
  {
    "sku" => row.fetch("sku", ""),
    "level" => row.fetch("level", ""),
    "board" => row.fetch("board", ""),
    "listing_title" => row.fetch("listing_title", ""),
    "source_slug_candidate" => row.fetch("slug_candidate", ""),
    "source_payhip_url_seed" => row.fetch("payhip_url_seed", ""),
    "final_payhip_url" => "",
    "update_target_file" => default_target_path(options[:level], row),
    "update_target_key_path" => default_key_path(options[:level], row),
    "status_backfilled" => "",
    "status_verified_live" => "",
    "notes" => ""
  }
end

ops_csv = File.join(level_dir, "#{options[:level]}-ops-sheet.csv")
backfill_csv = File.join(level_dir, "#{options[:level]}-url-backfill-template.csv")
checklist_md = File.join(level_dir, "#{options[:level]}-upload-execution-checklist.md")

write_csv(ops_csv, OPS_COLUMNS, ops_rows)
write_csv(backfill_csv, BACKFILL_COLUMNS, backfill_rows)
write_checklist(checklist_md, options[:level], ops_rows)

puts "== Payhip Level Execution Pack =="
puts "Level: #{options[:level].upcase}"
puts "Input batch: #{batch_csv}"
puts "Rows: #{rows.length}"
puts "Ops sheet: #{ops_csv}"
puts "Backfill template: #{backfill_csv}"
puts "Checklist: #{checklist_md}"
