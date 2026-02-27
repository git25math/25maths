#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "fileutils"
require "optparse"

ROOT = File.expand_path("../..", __dir__)
DEFAULT_SOURCE = File.join(ROOT, "payhip/presale/kahoot-payhip-merchant-copy-pack.csv")
DEFAULT_OUT_CSV = File.join(ROOT, "payhip/presale/payhip-series-listing-descriptions.csv")
DEFAULT_OUT_MD = File.join(ROOT, "payhip/presale/payhip-series-listing-descriptions.md")
DEFAULT_LEVEL_OUT_CSV = File.join(ROOT, "payhip/presale/payhip-level-listing-descriptions.csv")
DEFAULT_LEVEL_OUT_MD = File.join(ROOT, "payhip/presale/payhip-level-listing-descriptions.md")

OUT_COLUMNS = [
  "series_key",
  "level",
  "board",
  "board_label",
  "tier_scope",
  "sku_count",
  "price_early_bird",
  "price_regular",
  "early_bird_end_date",
  "release_date",
  "payhip_title_en",
  "payhip_title_zh",
  "short_description_en",
  "short_description_zh",
  "description_markdown_en",
  "description_markdown_zh",
  "cta_en",
  "cta_zh"
].freeze

def read_csv(path)
  rows = []
  CSV.foreach(path, headers: true) { |row| rows << row.to_h }
  rows
end

def write_csv(path, rows)
  FileUtils.mkdir_p(File.dirname(path))
  CSV.open(path, "w", write_headers: true, headers: OUT_COLUMNS) do |csv|
    rows.each do |row|
      csv << OUT_COLUMNS.map { |h| row[h] }
    end
  end
end

def slugify(text)
  text.to_s.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/^-+|-+$/, "")
end

def uniq_join(values)
  cleaned = values.map { |v| v.to_s.strip }.reject(&:empty?).uniq
  cleaned.join(" / ")
end

def level_meta(level)
  case level
  when "L1"
    {
      tag_en: "L1 SubTopic MVP",
      tag_zh: "L1 小专题 MVP",
      include_en: [
        "1 focused SubTopic worksheet pack (PDF)",
        "Answer key for fast self-check",
        "Matching Kahoot companion link",
        "Release-aligned presale update notes"
      ],
      include_zh: [
        "1 份小专题聚焦 Worksheet（PDF）",
        "配套答案，方便快速自检",
        "对应 Kahoot 练习链接",
        "按上架节奏更新的预售说明"
      ],
      use_case_en: "Best for targeted weak-point fixing and quick daily practice.",
      use_case_zh: "适合查漏补缺与日常短时高频训练。"
    }
  when "L2"
    {
      tag_en: "L2 Section Bundle",
      tag_zh: "L2 章节合集",
      include_en: [
        "Section-level worksheet bundle across connected SubTopics",
        "Answer set for each worksheet",
        "Kahoot companion links for section drilling",
        "Structured progression for one full section"
      ],
      include_zh: [
        "同章节多个 SubTopic 的 Worksheet 合集",
        "每份练习对应答案",
        "章节配套 Kahoot 训练链接",
        "按章节推进的系统化训练路径"
      ],
      use_case_en: "Best for section consolidation before mocks and topic tests.",
      use_case_zh: "适合模考前章节巩固与专题刷题。"
    }
  when "L3"
    {
      tag_en: "L3 Unit Bundle",
      tag_zh: "L3 单元合集",
      include_en: [
        "Unit-level bundle covering multiple sections",
        "Worksheet + answer workflow for each section",
        "Kahoot companion links across the unit",
        "Unit roadmap for exam-focused revision"
      ],
      include_zh: [
        "覆盖多个章节的单元级资料包",
        "每章节 Worksheet + 答案闭环",
        "单元维度的 Kahoot 配套链接",
        "围绕考试复习的单元学习路径"
      ],
      use_case_en: "Best for finishing one complete unit with fewer content gaps.",
      use_case_zh: "适合完整攻克一个单元并减少知识断层。"
    }
  else # L4
    {
      tag_en: "L4 All-Units Bundle",
      tag_zh: "L4 全科合集",
      include_en: [
        "Complete board-level bundle across all units",
        "Cross-unit worksheet + answer revision flow",
        "Kahoot companion coverage for the full roadmap",
        "Best-value package for long-cycle exam prep"
      ],
      include_zh: [
        "覆盖全考纲单元的整套资料",
        "跨单元 Worksheet + 答案复习闭环",
        "完整路线的 Kahoot 配套覆盖",
        "适合长期备考的高性价比组合"
      ],
      use_case_en: "Best for full syllabus preparation and final-stage consolidation.",
      use_case_zh: "适合全考纲备考与冲刺阶段系统回顾。"
    }
  end
end

def build_descriptions(level, board_label, tier_scope, sku_count, price_early_bird, price_regular, early_bird_end_date, release_date)
  meta = level_meta(level)
  title_en = "#{board_label} #{tier_scope} #{meta[:tag_en]} (Presale)"
  title_zh = "#{board_label} #{tier_scope} #{meta[:tag_zh]}（预售）"

  short_en = [
    "#{meta[:tag_en]} for #{board_label} #{tier_scope}.",
    "#{sku_count} product(s) in this series.",
    "Early-bird #{price_early_bird}, regular #{price_regular}.",
    "Release on #{release_date}."
  ].join(" ")

  short_zh = [
    "#{board_label} #{tier_scope} 的#{meta[:tag_zh]}。",
    "该系列共 #{sku_count} 个商品。",
    "早鸟价 #{price_early_bird}，原价 #{price_regular}。",
    "预计上架日期 #{release_date}。"
  ].join

  list_en = meta[:include_en].map { |item| "- #{item}" }.join("\n")
  list_zh = meta[:include_zh].map { |item| "- #{item}" }.join("\n")

  desc_en = <<~MD.strip
    ## #{meta[:tag_en]} Overview
    This is the #{meta[:tag_en]} presale series for **#{board_label} (#{tier_scope})**.

    ### What You Get
    #{list_en}

    ### Presale Terms
    - Early-bird price: **#{price_early_bird}** (until #{early_bird_end_date})
    - Regular price: **#{price_regular}**
    - Planned release date: **#{release_date}**
    - Purchase during presale locks in your early-bird price.

    ### Best For
    #{meta[:use_case_en]}

    ### Note
    Optional bilingual vocabulary support can be provided on request for students who need EN-ZH language assistance.
  MD

  desc_zh = <<~MD.strip
    ## #{meta[:tag_zh]}说明
    这是面向 **#{board_label}（#{tier_scope}）** 的#{meta[:tag_zh]}预售系列。

    ### 你将获得
    #{list_zh}

    ### 预售条款
    - 早鸟价：**#{price_early_bird}**（截止 #{early_bird_end_date}）
    - 正常价：**#{price_regular}**
    - 计划上架：**#{release_date}**
    - 预售期下单可锁定早鸟价格。

    ### 适用人群
    #{meta[:use_case_zh]}

    ### 补充说明
    对于有需要的学生，可按需提供中英双语词汇支持。
  MD

  cta_en = "Start with this #{meta[:tag_en]} series now and secure the early-bird price."
  cta_zh = "立即购买本#{meta[:tag_zh]}系列，锁定早鸟价。"

  [title_en, title_zh, short_en, short_zh, desc_en, desc_zh, cta_en, cta_zh]
end

def build_rows(rows)
  grouped = rows.group_by { |r| [r.fetch("level", ""), r.fetch("board", ""), r.fetch("board_label", ""), r.fetch("tier_scope", "")] }

  out_rows = grouped.map do |(level, board, board_label, tier_scope), group_rows|
    sku_count = group_rows.size
    price_early_bird = uniq_join(group_rows.map { |r| r.fetch("price_early_bird", "") })
    price_regular = uniq_join(group_rows.map { |r| r.fetch("price_regular", "") })
    early_bird_end_date = uniq_join(group_rows.map { |r| r.fetch("early_bird_end_date", "") })
    release_date = uniq_join(group_rows.map { |r| r.fetch("release_date", "") })
    title_en, title_zh, short_en, short_zh, desc_en, desc_zh, cta_en, cta_zh = build_descriptions(
      level, board_label, tier_scope, sku_count, price_early_bird, price_regular, early_bird_end_date, release_date
    )

    {
      "series_key" => [level.downcase, slugify(board), slugify(tier_scope)].join("-"),
      "level" => level,
      "board" => board,
      "board_label" => board_label,
      "tier_scope" => tier_scope,
      "sku_count" => sku_count.to_s,
      "price_early_bird" => price_early_bird,
      "price_regular" => price_regular,
      "early_bird_end_date" => early_bird_end_date,
      "release_date" => release_date,
      "payhip_title_en" => title_en,
      "payhip_title_zh" => title_zh,
      "short_description_en" => short_en,
      "short_description_zh" => short_zh,
      "description_markdown_en" => desc_en,
      "description_markdown_zh" => desc_zh,
      "cta_en" => cta_en,
      "cta_zh" => cta_zh
    }
  end

  out_rows.sort_by { |r| [r.fetch("level"), r.fetch("board"), r.fetch("tier_scope")] }
end

def write_markdown(path, rows)
  lines = []
  lines << "# Payhip Series Listing Descriptions"
  lines << ""
  lines << "Generated from `payhip/presale/kahoot-payhip-merchant-copy-pack.csv`."
  lines << ""

  rows.each do |row|
    lines << "## #{row.fetch('series_key')}"
    lines << ""
    lines << "- Level: `#{row.fetch('level')}`"
    lines << "- Board: `#{row.fetch('board_label')}`"
    lines << "- Tier: `#{row.fetch('tier_scope')}`"
    lines << "- SKU count: `#{row.fetch('sku_count')}`"
    lines << "- Price: `#{row.fetch('price_early_bird')} -> #{row.fetch('price_regular')}`"
    lines << "- Early-bird end: `#{row.fetch('early_bird_end_date')}`"
    lines << "- Release: `#{row.fetch('release_date')}`"
    lines << ""
    lines << "### Payhip Title EN"
    lines << row.fetch("payhip_title_en")
    lines << ""
    lines << "### Payhip Title ZH"
    lines << row.fetch("payhip_title_zh")
    lines << ""
    lines << "### Short Description EN"
    lines << row.fetch("short_description_en")
    lines << ""
    lines << "### Short Description ZH"
    lines << row.fetch("short_description_zh")
    lines << ""
    lines << "### Description EN"
    lines << row.fetch("description_markdown_en")
    lines << ""
    lines << "### Description ZH"
    lines << row.fetch("description_markdown_zh")
    lines << ""
    lines << "### CTA EN"
    lines << row.fetch("cta_en")
    lines << ""
    lines << "### CTA ZH"
    lines << row.fetch("cta_zh")
    lines << ""
  end

  FileUtils.mkdir_p(File.dirname(path))
  File.write(path, lines.join("\n") + "\n")
end

def build_level_rows(rows)
  grouped = rows.group_by { |r| r.fetch("level", "") }
  grouped.map do |level, group_rows|
    meta = level_meta(level)
    sku_count = group_rows.size
    price_early_bird = uniq_join(group_rows.map { |r| r.fetch("price_early_bird", "") })
    price_regular = uniq_join(group_rows.map { |r| r.fetch("price_regular", "") })
    early_bird_end_date = uniq_join(group_rows.map { |r| r.fetch("early_bird_end_date", "") })
    release_date = uniq_join(group_rows.map { |r| r.fetch("release_date", "") })
    board_scope = uniq_join(group_rows.map { |r| r.fetch("board_label", "") })
    tier_scope = uniq_join(group_rows.map { |r| r.fetch("tier_scope", "") })
    title_en = "#{meta[:tag_en]} Series (All Boards)"
    title_zh = "#{meta[:tag_zh]}系列（全考局）"

    short_en = [
      "#{meta[:tag_en]} across #{board_scope}.",
      "#{sku_count} product(s) in total.",
      "Early-bird #{price_early_bird}, regular #{price_regular}.",
      "Release windows: #{release_date}."
    ].join(" ")

    short_zh = [
      "#{meta[:tag_zh]}，覆盖 #{board_scope}。",
      "总计 #{sku_count} 个商品。",
      "早鸟价 #{price_early_bird}，原价 #{price_regular}。",
      "上架时间窗：#{release_date}。"
    ].join

    list_en = meta[:include_en].map { |item| "- #{item}" }.join("\n")
    list_zh = meta[:include_zh].map { |item| "- #{item}" }.join("\n")

    desc_en = <<~MD.strip
      ## #{meta[:tag_en]} Series Overview
      This series covers **#{board_scope}** across tiers **#{tier_scope}**.

      ### What You Get
      #{list_en}

      ### Presale Terms
      - Early-bird price: **#{price_early_bird}** (until #{early_bird_end_date})
      - Regular price: **#{price_regular}**
      - Planned release windows: **#{release_date}**
      - Purchase during presale locks in your early-bird price.

      ### Best For
      #{meta[:use_case_en]}
    MD

    desc_zh = <<~MD.strip
      ## #{meta[:tag_zh]}系列说明
      本系列覆盖 **#{board_scope}**，层级范围为 **#{tier_scope}**。

      ### 你将获得
      #{list_zh}

      ### 预售条款
      - 早鸟价：**#{price_early_bird}**（截止 #{early_bird_end_date}）
      - 正常价：**#{price_regular}**
      - 计划上架时间窗：**#{release_date}**
      - 预售期下单可锁定早鸟价格。

      ### 适用人群
      #{meta[:use_case_zh]}
    MD

    {
      "series_key" => level.downcase,
      "level" => level,
      "board" => "all",
      "board_label" => board_scope,
      "tier_scope" => tier_scope,
      "sku_count" => sku_count.to_s,
      "price_early_bird" => price_early_bird,
      "price_regular" => price_regular,
      "early_bird_end_date" => early_bird_end_date,
      "release_date" => release_date,
      "payhip_title_en" => title_en,
      "payhip_title_zh" => title_zh,
      "short_description_en" => short_en,
      "short_description_zh" => short_zh,
      "description_markdown_en" => desc_en,
      "description_markdown_zh" => desc_zh,
      "cta_en" => "Join the #{meta[:tag_en]} series now and lock your early-bird price.",
      "cta_zh" => "立即加入#{meta[:tag_zh]}系列并锁定早鸟价。"
    }
  end.sort_by { |r| r.fetch("level") }
end

options = {
  source: DEFAULT_SOURCE,
  out_csv: DEFAULT_OUT_CSV,
  out_md: DEFAULT_OUT_MD,
  level_out_csv: DEFAULT_LEVEL_OUT_CSV,
  level_out_md: DEFAULT_LEVEL_OUT_MD
}

OptionParser.new do |opts|
  opts.banner = "Usage: ruby scripts/payhip/generate_payhip_series_descriptions.rb [options]"
  opts.on("--source PATH", "Merchant copy source CSV") { |v| options[:source] = v }
  opts.on("--out-csv PATH", "Output CSV path") { |v| options[:out_csv] = v }
  opts.on("--out-md PATH", "Output Markdown path") { |v| options[:out_md] = v }
  opts.on("--level-out-csv PATH", "Level-only output CSV path") { |v| options[:level_out_csv] = v }
  opts.on("--level-out-md PATH", "Level-only output Markdown path") { |v| options[:level_out_md] = v }
end.parse!

source_rows = read_csv(options[:source])
if source_rows.empty?
  warn "No rows found in #{options[:source]}"
  exit 1
end

out_rows = build_rows(source_rows)
write_csv(options[:out_csv], out_rows)
write_markdown(options[:out_md], out_rows)

level_rows = build_level_rows(source_rows)
write_csv(options[:level_out_csv], level_rows)
write_markdown(options[:level_out_md], level_rows)

puts "== Payhip Series Listing Descriptions =="
puts "Input rows: #{source_rows.size}"
puts "Series rows: #{out_rows.size}"
puts "Output CSV: #{options[:out_csv]}"
puts "Output MD: #{options[:out_md]}"
puts "Level rows: #{level_rows.size}"
puts "Level CSV: #{options[:level_out_csv]}"
puts "Level MD: #{options[:level_out_md]}"
