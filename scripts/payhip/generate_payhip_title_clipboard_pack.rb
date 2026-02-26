#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "optparse"

ROOT = File.expand_path("../..", __dir__)
DEFAULT_SOURCE = File.join(ROOT, "payhip/presale/upload-batches/payhip-title-short-all.csv")
DEFAULT_OUT_DIR = File.join(ROOT, "payhip/presale/upload-batches")
LEVELS = %w[L1 L2 L3 L4].freeze
SHORT_TITLE_LIMIT = 60

MANUAL_TITLE_OVERRIDES = {
  "L2-EDX4MA1-F2" => "4MA1 F2 Equations, Formulae & Identities (Fdn) Sec Bundle",
  "L2-EDX4MA1-F3" => "4MA1 F3 Functions, Sequences & Graphs (Fdn) Sec Bundle",
  "L2-EDX4MA1-F4" => "4MA1 F4 Geometry & Mensuration (Fdn) Sec Bundle",
  "L2-EDX4MA1-H2" => "4MA1 H2 Equations, Formulae & Identities (H) Sec Bundle",
  "L2-EDX4MA1-H3" => "4MA1 H3 Functions, Sequences & Graphs (H) Sec Bundle"
}.freeze

OUT_COLUMNS = [
  "upload_priority",
  "sku",
  "level",
  "board",
  "board_label",
  "tier_scope",
  "final_title_en",
  "title_variant_used",
  "final_title_len",
  "listing_title_short_en",
  "listing_title_mobile_en",
  "price_early_bird",
  "price_regular",
  "payhip_url_seed"
].freeze

MIN_COLUMNS = [
  "sku",
  "level",
  "final_title_en"
].freeze

def read_csv(path)
  rows = []
  CSV.foreach(path, headers: true) { |row| rows << row.to_h }
  rows
end

def write_csv(path, headers, rows)
  FileUtils.mkdir_p(File.dirname(path))
  CSV.open(path, "w", write_headers: true, headers: headers) do |csv|
    rows.each do |row|
      csv << headers.map { |h| row[h] }
    end
  end
end

def write_tsv(path, headers, rows)
  FileUtils.mkdir_p(File.dirname(path))
  File.open(path, "w") do |f|
    f.puts(headers.join("\t"))
    rows.each do |row|
      f.puts(headers.map { |h| row[h].to_s }.join("\t"))
    end
  end
end

def normalize_ampersand_spacing(text)
  text.to_s.gsub(/\s*&\s*/, " & ").gsub(/\s+/, " ").strip
end

def select_final_title(row)
  sku = row.fetch("sku", "").to_s
  if MANUAL_TITLE_OVERRIDES.key?(sku)
    return [normalize_ampersand_spacing(MANUAL_TITLE_OVERRIDES.fetch(sku)), "manual"]
  end

  short = row.fetch("listing_title_short_en", "").to_s.strip
  mobile = row.fetch("listing_title_mobile_en", "").to_s.strip
  short_len = row.fetch("listing_title_short_len", "").to_i

  if short.empty? && !mobile.empty?
    return [normalize_ampersand_spacing(mobile), "mobile"]
  end
  if mobile.empty?
    return [normalize_ampersand_spacing(short), "short"]
  end
  return [normalize_ampersand_spacing(short), "short"] if short_len.positive? && short_len <= SHORT_TITLE_LIMIT

  [normalize_ampersand_spacing(mobile), "mobile"]
end

def build_rows(source_rows)
  source_rows.map do |row|
    final_title, variant = select_final_title(row)
    {
      "upload_priority" => row.fetch("upload_priority", ""),
      "sku" => row.fetch("sku", ""),
      "level" => row.fetch("level", ""),
      "board" => row.fetch("board", ""),
      "board_label" => row.fetch("board_label", ""),
      "tier_scope" => row.fetch("tier_scope", ""),
      "final_title_en" => final_title,
      "title_variant_used" => variant,
      "final_title_len" => final_title.length.to_s,
      "listing_title_short_en" => row.fetch("listing_title_short_en", ""),
      "listing_title_mobile_en" => row.fetch("listing_title_mobile_en", ""),
      "price_early_bird" => row.fetch("price_early_bird", ""),
      "price_regular" => row.fetch("price_regular", ""),
      "payhip_url_seed" => row.fetch("payhip_url_seed", "")
    }
  end
end

def build_min_rows(rows)
  rows.map do |row|
    {
      "sku" => row.fetch("sku", ""),
      "level" => row.fetch("level", ""),
      "final_title_en" => row.fetch("final_title_en", "")
    }
  end
end

options = {
  source: DEFAULT_SOURCE,
  out_dir: DEFAULT_OUT_DIR
}

OptionParser.new do |opts|
  opts.banner = "Usage: ruby scripts/payhip/generate_payhip_title_clipboard_pack.rb [options]"
  opts.on("--source PATH", "Input short-title CSV") { |v| options[:source] = v }
  opts.on("--out-dir PATH", "Output directory") { |v| options[:out_dir] = v }
end.parse!

source_rows = read_csv(options[:source])
if source_rows.empty?
  warn "No rows found in #{options[:source]}"
  exit 1
end

rows = build_rows(source_rows)
rows.sort_by! { |r| [r.fetch("upload_priority").to_i, r.fetch("level"), r.fetch("sku")] }

all_csv = File.join(options[:out_dir], "payhip-title-clipboard-all.csv")
all_tsv = File.join(options[:out_dir], "payhip-title-clipboard-all.tsv")
all_min_csv = File.join(options[:out_dir], "payhip-title-clipboard-min-all.csv")
mobile_review_csv = File.join(options[:out_dir], "payhip-title-clipboard-mobile-only.csv")
write_csv(all_csv, OUT_COLUMNS, rows)
write_tsv(all_tsv, OUT_COLUMNS, rows)
write_csv(all_min_csv, MIN_COLUMNS, build_min_rows(rows))
write_csv(
  mobile_review_csv,
  OUT_COLUMNS,
  rows.select { |r| r.fetch("title_variant_used") == "mobile" }
)

LEVELS.each do |level|
  level_rows = rows.select { |r| r.fetch("level") == level }
  level_down = level.downcase
  write_csv(
    File.join(options[:out_dir], "payhip-title-clipboard-#{level_down}.csv"),
    OUT_COLUMNS,
    level_rows
  )
  write_tsv(
    File.join(options[:out_dir], "payhip-title-clipboard-#{level_down}.tsv"),
    OUT_COLUMNS,
    level_rows
  )
  write_csv(
    File.join(options[:out_dir], "payhip-title-clipboard-min-#{level_down}.csv"),
    MIN_COLUMNS,
    build_min_rows(level_rows)
  )
end

mobile_count = rows.count { |r| r.fetch("title_variant_used") == "mobile" }
short_count = rows.count { |r| r.fetch("title_variant_used") == "short" }
max_len = rows.map { |r| r.fetch("final_title_len").to_i }.max

puts "== Payhip Title Clipboard Pack =="
puts "Input: #{options[:source]}"
puts "Rows: #{rows.length}"
puts "Short used: #{short_count}"
puts "Mobile used: #{mobile_count}"
puts "Max final title length: #{max_len}"
puts "Output all CSV: #{all_csv}"
puts "Output all TSV: #{all_tsv}"
puts "Output min CSV: #{all_min_csv}"
puts "Output mobile review CSV: #{mobile_review_csv}"
