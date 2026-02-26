#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "optparse"

ROOT = File.expand_path("../..", __dir__)
DEFAULT_COPY_PACK = File.join(ROOT, "payhip/presale/kahoot-payhip-merchant-copy-pack.csv")
DEFAULT_MANIFEST = File.join(ROOT, "payhip/presale/listing-assets/payhip-cover-manifest.csv")
DEFAULT_OUT_DIR = File.join(ROOT, "payhip/presale/upload-batches")

LEVEL_PRIORITY = {
  "L3" => 1, # revenue-first
  "L4" => 2,
  "L2" => 3,
  "L1" => 4
}.freeze

OUT_COLUMNS = [
  "upload_priority",
  "sku",
  "level",
  "board",
  "board_label",
  "tier_scope",
  "listing_title",
  "listing_title_short_en",
  "listing_title_mobile_en",
  "listing_title_original_len",
  "listing_title_short_len",
  "listing_title_mobile_len",
  "subtitle_en",
  "subtitle_zh",
  "short_description_en",
  "short_description_zh",
  "description_markdown_en",
  "description_markdown_zh",
  "seo_title_en",
  "seo_description_en",
  "cta_label_en",
  "cta_label_zh",
  "price_early_bird",
  "price_regular",
  "early_bird_end_date",
  "release_date",
  "payhip_url_seed",
  "tags",
  "main_cover_png",
  "main_cover_svg",
  "image_folder",
  "kahoot_url",
  "worksheet_url",
  "section_bundle_url",
  "unit_bundle_url",
  "deliver_now",
  "deliver_on_release",
  "bonus",
  "slug_candidate"
].freeze

SHORT_TITLE_COLUMNS = [
  "upload_priority",
  "sku",
  "level",
  "board",
  "board_label",
  "tier_scope",
  "listing_title",
  "listing_title_short_en",
  "listing_title_mobile_en",
  "listing_title_original_len",
  "listing_title_short_len",
  "listing_title_mobile_len",
  "price_early_bird",
  "price_regular",
  "payhip_url_seed",
  "slug_candidate"
].freeze

def read_csv(path)
  rows = []
  CSV.foreach(path, headers: true) do |row|
    rows << row.to_h
  end
  rows
end

def write_csv_with_headers(path, headers, rows)
  FileUtils.mkdir_p(File.dirname(path))
  CSV.open(path, "w", write_headers: true, headers: headers) do |csv|
    rows.each do |row|
      csv << headers.map { |k| row[k] }
    end
  end
end

def write_csv(path, rows)
  write_csv_with_headers(path, OUT_COLUMNS, rows)
end

def write_summary(path, counts, total)
  lines = []
  lines << "# Payhip Upload Batches"
  lines << ""
  lines << "Revenue-first upload order:"
  lines << "1. L3"
  lines << "2. L4"
  lines << "3. L2"
  lines << "4. L1"
  lines << ""
  lines << "## Batch Counts"
  lines << ""
  %w[L3 L4 L2 L1].each do |level|
    lines << "- #{level}: #{counts.fetch(level, 0)}"
  end
  lines << "- Total: #{total}"
  lines << ""
  lines << "## Output Files"
  lines << ""
  lines << "- `payhip/presale/upload-batches/payhip-upload-batch-all.csv`"
  lines << "- `payhip/presale/upload-batches/payhip-upload-batch-l1.csv`"
  lines << "- `payhip/presale/upload-batches/payhip-upload-batch-l2.csv`"
  lines << "- `payhip/presale/upload-batches/payhip-upload-batch-l3.csv`"
  lines << "- `payhip/presale/upload-batches/payhip-upload-batch-l4.csv`"
  lines << "- `payhip/presale/upload-batches/payhip-title-short-all.csv`"
  lines << "- `payhip/presale/upload-batches/payhip-title-short-l1.csv`"
  lines << "- `payhip/presale/upload-batches/payhip-title-short-l2.csv`"
  lines << "- `payhip/presale/upload-batches/payhip-title-short-l3.csv`"
  lines << "- `payhip/presale/upload-batches/payhip-title-short-l4.csv`"
  lines << ""
  lines << "Title fields:"
  lines << "- `listing_title`: original"
  lines << "- `listing_title_short_en`: short version for Payhip product title"
  lines << "- `listing_title_mobile_en`: extra-compact mobile fallback"
  lines << ""
  lines << "Use `main_cover_png` and `image_folder` to locate your upload images quickly."
  File.write(path, lines.join("\n") + "\n")
end

def normalize_ws(text)
  text.to_s.gsub(/\s+/, " ").strip
end

def compact_phrases(text)
  s = normalize_ws(text)
  replacements = [
    [/\bPythagoras Theorem\b/i, "Pythagoras"],
    [/\bGraphical Representation Of Data\b/i, "Graphical Data"],
    [/\bSimultaneous Linear Equations\b/i, "Simultaneous Eqns"],
    [/\bFractions Decimals Percentages\b/i, "FDP"],
    [/\bRelative And Expected Frequencies\b/i, "Rel & Exp Freq"],
    [/\bStatistics And Probability\b/i, "Stats & Prob"],
    [/\bTransformations And Vectors\b/i, "Transforms & Vectors"],
    [/\bVectors And Transformations\b/i, "Vectors & Transforms"],
    [/\bCoordinate Geometry\b/i, "Coord Geometry"],
    [/\bUsing A Calculator\b/i, "Calculator Use"],
    [/\bExponential Growth Decay\b/i, "Exp Growth/Decay"],
    [/\bGeometrical Constructions\b/i, "Geo Constructions"],
    [/\bGeometrical Terms\b/i, "Geo Terms"],
    [/\bGeometrical Reasoning\b/i, "Geo Reasoning"],
    [/\bAngles Lines And Triangles\b/i, "Angles, Lines & Triangles"],
    [/\bSurface Area And Volume\b/i, "Surface Area & Volume"],
    [/\bCompound Shapes And Parts Of Shapes\b/i, "Compound Shapes"],
    [/\bFunctions, Sequences and Graphs\b/i, "Functions, Sequences & Graphs"],
    [/\bEquations, Formulae and Identities\b/i, "Equations, Formulae & Identities"],
    [/\b and \b/i, " & "]
  ]
  replacements.each { |pat, rep| s = s.gsub(pat, rep) }
  normalize_ws(s)
end

def shorten_title(listing_title, level, max_len:)
  base = normalize_ws(listing_title)
  base = base.sub(/\s+Worksheet \+ Kahoot Companion/i, "") if level == "L1"
  base = base.sub(/\s+Section Bundle/i, " Sec Bundle") if level == "L2"
  base = base.sub(/\s+Unit Bundle/i, " Unit") if level == "L3"
  base = base.sub(/\s+All-Units Mega Bundle/i, " All-Units Bundle") if level == "L4"
  base = compact_phrases(base)
  return base if base.length <= max_len

  candidates = []
  candidates << base.gsub("CIE 0580", "CIE0580").gsub("Edexcel 4MA1", "4MA1")
  candidates << candidates[-1].gsub(/\bFoundation\b/i, "Fdn")
                             .gsub(/\bExtended\b/i, "Ext")
                             .gsub(/\bHigher\b/i, "H")
                             .gsub(/\bCore\b/i, "C")
  candidates << candidates[-1].gsub(" & ", "&")
  candidates << candidates[-1].gsub(/\s*\(([^)]*)\)\s*/, " \\1 ")
  candidates << candidates[-1].gsub(/\s+/, " ")

  candidates.each do |c|
    c = normalize_ws(c)
    return c if c.length <= max_len
  end

  truncated = candidates.last.to_s
  truncated = normalize_ws(truncated)
  return truncated if truncated.length <= max_len

  truncated[0, max_len - 1].rstrip + "…"
end

def build_short_titles(listing_title, level)
  short = shorten_title(listing_title, level, max_len: 68)
  mobile = shorten_title(listing_title, level, max_len: 52)
  [short, mobile]
end

def build_rows(copy_rows, cover_by_sku)
  copy_rows.map do |row|
    sku = row.fetch("sku", "")
    level = row.fetch("level", "").upcase
    listing_title = row.fetch("listing_title", "")
    short_title, mobile_title = build_short_titles(listing_title, level)
    cover = cover_by_sku.fetch(sku, {})
    cover_png = cover.fetch("cover_png", "")
    cover_svg = cover.fetch("cover_svg", "")
    image_folder = cover_png.empty? ? "" : File.dirname(cover_png)

    {
      "upload_priority" => LEVEL_PRIORITY.fetch(level, 99).to_s,
      "sku" => sku,
      "level" => level,
      "board" => row.fetch("board", ""),
      "board_label" => row.fetch("board_label", ""),
      "tier_scope" => row.fetch("tier_scope", ""),
      "listing_title" => listing_title,
      "listing_title_short_en" => short_title,
      "listing_title_mobile_en" => mobile_title,
      "listing_title_original_len" => listing_title.length.to_s,
      "listing_title_short_len" => short_title.length.to_s,
      "listing_title_mobile_len" => mobile_title.length.to_s,
      "subtitle_en" => row.fetch("subtitle_en", ""),
      "subtitle_zh" => row.fetch("subtitle_zh", ""),
      "short_description_en" => row.fetch("short_description_en", ""),
      "short_description_zh" => row.fetch("short_description_zh", ""),
      "description_markdown_en" => row.fetch("description_markdown_en", ""),
      "description_markdown_zh" => row.fetch("description_markdown_zh", ""),
      "seo_title_en" => row.fetch("seo_title_en", ""),
      "seo_description_en" => row.fetch("seo_description_en", ""),
      "cta_label_en" => row.fetch("cta_label_en", ""),
      "cta_label_zh" => row.fetch("cta_label_zh", ""),
      "price_early_bird" => row.fetch("price_early_bird", ""),
      "price_regular" => row.fetch("price_regular", ""),
      "early_bird_end_date" => row.fetch("early_bird_end_date", ""),
      "release_date" => row.fetch("release_date", ""),
      "payhip_url_seed" => row.fetch("payhip_url_seed", ""),
      "tags" => row.fetch("tags", ""),
      "main_cover_png" => cover_png,
      "main_cover_svg" => cover_svg,
      "image_folder" => image_folder,
      "kahoot_url" => row.fetch("kahoot_url", ""),
      "worksheet_url" => row.fetch("worksheet_url", ""),
      "section_bundle_url" => row.fetch("section_bundle_url", ""),
      "unit_bundle_url" => row.fetch("unit_bundle_url", ""),
      "deliver_now" => row.fetch("deliver_now", ""),
      "deliver_on_release" => row.fetch("deliver_on_release", ""),
      "bonus" => row.fetch("bonus", ""),
      "slug_candidate" => row.fetch("slug_candidate", "")
    }
  end
end

def build_short_title_rows(out_rows)
  out_rows.map do |row|
    {
      "upload_priority" => row.fetch("upload_priority", ""),
      "sku" => row.fetch("sku", ""),
      "level" => row.fetch("level", ""),
      "board" => row.fetch("board", ""),
      "board_label" => row.fetch("board_label", ""),
      "tier_scope" => row.fetch("tier_scope", ""),
      "listing_title" => row.fetch("listing_title", ""),
      "listing_title_short_en" => row.fetch("listing_title_short_en", ""),
      "listing_title_mobile_en" => row.fetch("listing_title_mobile_en", ""),
      "listing_title_original_len" => row.fetch("listing_title_original_len", ""),
      "listing_title_short_len" => row.fetch("listing_title_short_len", ""),
      "listing_title_mobile_len" => row.fetch("listing_title_mobile_len", ""),
      "price_early_bird" => row.fetch("price_early_bird", ""),
      "price_regular" => row.fetch("price_regular", ""),
      "payhip_url_seed" => row.fetch("payhip_url_seed", ""),
      "slug_candidate" => row.fetch("slug_candidate", "")
    }
  end
end

options = {
  copy_pack: DEFAULT_COPY_PACK,
  manifest: DEFAULT_MANIFEST,
  out_dir: DEFAULT_OUT_DIR
}

OptionParser.new do |opts|
  opts.banner = "Usage: ruby scripts/payhip/generate_payhip_upload_batches.rb [options]"

  opts.on("--copy-pack PATH", "Unified merchant copy pack CSV") do |v|
    options[:copy_pack] = v
  end
  opts.on("--manifest PATH", "Cover manifest CSV") do |v|
    options[:manifest] = v
  end
  opts.on("--out-dir PATH", "Output folder for upload batches") do |v|
    options[:out_dir] = v
  end
end.parse!

copy_rows = read_csv(options[:copy_pack])
if copy_rows.empty?
  warn "No rows found in #{options[:copy_pack]}"
  exit 1
end

manifest_rows = read_csv(options[:manifest])
cover_by_sku = {}
manifest_rows.each do |row|
  cover_by_sku[row.fetch("sku", "")] = row
end

out_rows = build_rows(copy_rows, cover_by_sku)
out_rows.sort_by! do |row|
  [row.fetch("upload_priority").to_i, row.fetch("level"), row.fetch("board"), row.fetch("sku")]
end

all_path = File.join(options[:out_dir], "payhip-upload-batch-all.csv")
write_csv(all_path, out_rows)

counts = {}
%w[L1 L2 L3 L4].each do |level|
  level_rows = out_rows.select { |r| r.fetch("level") == level }
  counts[level] = level_rows.length
  level_path = File.join(options[:out_dir], "payhip-upload-batch-#{level.downcase}.csv")
  write_csv(level_path, level_rows)
end

title_rows = build_short_title_rows(out_rows)
title_all_path = File.join(options[:out_dir], "payhip-title-short-all.csv")
write_csv_with_headers(title_all_path, SHORT_TITLE_COLUMNS, title_rows)

%w[L1 L2 L3 L4].each do |level|
  level_title_rows = title_rows.select { |r| r.fetch("level") == level }
  level_title_path = File.join(options[:out_dir], "payhip-title-short-#{level.downcase}.csv")
  write_csv_with_headers(level_title_path, SHORT_TITLE_COLUMNS, level_title_rows)
end

readme_path = File.join(options[:out_dir], "README.md")
write_summary(readme_path, counts, out_rows.length)

puts "== Payhip Upload Batches =="
puts "Input copy rows: #{copy_rows.length}"
puts "Input manifest rows: #{manifest_rows.length}"
puts "Output all: #{all_path}"
puts "Short titles: #{title_all_path}"
%w[L3 L4 L2 L1].each do |level|
  puts "#{level}: #{counts.fetch(level, 0)}"
end
