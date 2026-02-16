#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path('/Users/zhuxingzhe/Project/ExamBoard/25maths-website')
DATA_DIR = ROOT / '_data'
LINKS_FILE = DATA_DIR / 'kahoot_subtopic_links.json'

CIE_DOMAIN_LABELS = {
    'number': 'Number',
    'algebra': 'Algebra and Graphs',
    'coordinate': 'Coordinate Geometry',
    'geometry': 'Geometry',
    'mensuration': 'Mensuration',
    'trigonometry': 'Trigonometry',
    'transformations': 'Transformations and Vectors',
    'probability': 'Probability',
    'statistics': 'Statistics',
}

EDX_DOMAIN_LABELS = {
    'number': 'Number and Arithmetic',
    'equations': 'Equations, Formulae and Identities',
    'sequences': 'Functions, Sequences and Graphs',
    'geometry': 'Geometry and Mensuration',
    'vectors': 'Vectors and Transformations',
    'statistics': 'Statistics and Probability',
}


def title_from_slug(slug: str) -> str:
    parts = slug.split('-')
    if len(parts) >= 3 and re.match(r'^[a-z]\d+$', parts[0], re.I) and parts[1].isdigit():
        words = parts[2:]
    else:
        words = parts
    text = ' '.join(words)
    text = text.replace('2d', '2D').replace('3d', '3D')
    text = text.replace('gcse', 'GCSE').replace('igcse', 'IGCSE')
    return text


def code_from_slug(slug: str) -> str:
    parts = slug.split('-')
    if len(parts) >= 2 and re.match(r'^[a-z]\d+$', parts[0], re.I) and parts[1].isdigit():
        return f"{parts[0].upper()}-{parts[1]}"
    return slug.upper()


def parse_section_name(name: str):
    m = re.match(r'^([a-z]+)-([a-z])(\d+)(?:-(.+))?$', name)
    if not m:
        return None
    domain = m.group(1)
    tier_letter = m.group(2).lower()
    num = int(m.group(3))
    suffix = m.group(4) or ''
    return domain, tier_letter, num, suffix


def build_board_data(board_slug: str, tier_map: dict[str, str], domain_labels: dict[str, str], tier_order: dict[str, int]):
    micro_root = ROOT / 'projects' / 'kahoot-channel' / board_slug / 'micro-topics'
    sections = []
    all_ids: list[str] = []
    missing_covers: list[str] = []

    for section_dir in sorted([p for p in micro_root.iterdir() if p.is_dir()]):
        section_name = section_dir.name
        subdirs = sorted([p for p in section_dir.iterdir() if p.is_dir()])
        if not subdirs:
            continue

        parsed = parse_section_name(section_name)
        if parsed:
            domain, tier_letter, num, suffix = parsed
        else:
            domain, tier_letter, num, suffix = section_name, '', 999, ''

        tier_label = tier_map.get(tier_letter, 'Other')
        domain_label = domain_labels.get(domain, domain.replace('-', ' ').title())
        section_code = f"{tier_letter.upper()}{num}" if tier_letter else section_name.upper()

        section_title = f"{domain_label} ({tier_label})"
        if suffix:
            section_title = f"{section_title} - {suffix.replace('-', ' ').title()}"

        items = []
        for sub in subdirs:
            cover_path = sub / 'cover-2320x1520-kahoot-minimal.png'
            if not cover_path.exists():
                missing_covers.append(str(sub))
            rel_cover = '/' + str(cover_path.relative_to(ROOT)).replace('\\\\', '/')
            subtopic_id = f"{board_slug}:{section_name}:{sub.name}"
            all_ids.append(subtopic_id)
            item = {
                'id': subtopic_id,
                'slug': sub.name,
                'code': code_from_slug(sub.name),
                'title': title_from_slug(sub.name),
                'cover': rel_cover,
                'section': section_name,
                'tier': tier_label,
                'has_cover': cover_path.exists(),
                'folder_path': '/' + str(sub.relative_to(ROOT)).replace('\\\\', '/'),
            }
            items.append(item)

        sections.append({
            'section_key': section_name,
            'section_code': section_code,
            'section_title': section_title,
            'domain': domain,
            'tier': tier_label,
            'tier_letter': tier_letter.upper(),
            'syllabus_number': num,
            'suffix': suffix,
            'count': len(items),
            'items': items,
            '_sort': [num, tier_order.get(tier_letter, 9), 1 if suffix else 0, section_name],
        })

    sections.sort(key=lambda s: tuple(s['_sort']))
    for s in sections:
        s.pop('_sort', None)

    if missing_covers:
        missing_list = '\n'.join(missing_covers)
        raise SystemExit(
            f'Missing cover-2320x1520-kahoot-minimal.png in these subtopic folders:\n{missing_list}'
        )

    total = sum(s['count'] for s in sections)
    return {'total_subtopics': total, 'sections': sections}, all_ids


def load_links() -> dict[str, dict[str, str]]:
    if not LINKS_FILE.exists():
        return {}
    return json.loads(LINKS_FILE.read_text(encoding='utf-8'))


def default_link_entry() -> dict[str, str]:
    return {
        'kahoot_url': '',
        'worksheet_payhip_url': '',
        'bundle_url': '',
        'past_paper_analysis_url': '',
        'variant_practice_url': '',
        'status': 'planned',
        'notes': '',
    }


def sync_links(existing: dict[str, dict[str, str]], ids: list[str]) -> dict[str, dict[str, str]]:
    merged: dict[str, dict[str, str]] = {}
    for subtopic_id in ids:
        row = default_link_entry()
        if subtopic_id in existing and isinstance(existing[subtopic_id], dict):
            for key, value in existing[subtopic_id].items():
                if key in row and isinstance(value, str):
                    row[key] = value
        merged[subtopic_id] = row

    # Preserve older IDs not present anymore, but mark as archived.
    for stale_id, stale_value in existing.items():
        if stale_id in merged:
            continue
        if not isinstance(stale_value, dict):
            continue
        row = default_link_entry()
        for key, value in stale_value.items():
            if key in row and isinstance(value, str):
                row[key] = value
        if row['status'] == 'planned':
            row['status'] = 'archived'
        merged[stale_id] = row

    return merged


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    cie_data, cie_ids = build_board_data(
        board_slug='cie0580',
        tier_map={'c': 'Core', 'e': 'Extended'},
        domain_labels=CIE_DOMAIN_LABELS,
        tier_order={'c': 0, 'e': 1},
    )

    edx_data, edx_ids = build_board_data(
        board_slug='edexcel-4ma1',
        tier_map={'f': 'Foundation', 'h': 'Higher'},
        domain_labels=EDX_DOMAIN_LABELS,
        tier_order={'f': 0, 'h': 1},
    )

    (DATA_DIR / 'kahoot_cie0580_subtopics.json').write_text(
        json.dumps(cie_data, ensure_ascii=True, indent=2) + '\n',
        encoding='utf-8',
    )
    (DATA_DIR / 'kahoot_edexcel4ma1_subtopics.json').write_text(
        json.dumps(edx_data, ensure_ascii=True, indent=2) + '\n',
        encoding='utf-8',
    )

    existing_links = load_links()
    all_ids = cie_ids + edx_ids
    merged_links = sync_links(existing_links, all_ids)
    LINKS_FILE.write_text(json.dumps(merged_links, ensure_ascii=True, indent=2) + '\n', encoding='utf-8')

    print('Generated:')
    print(DATA_DIR / 'kahoot_cie0580_subtopics.json')
    print(DATA_DIR / 'kahoot_edexcel4ma1_subtopics.json')
    print(LINKS_FILE)
    print(f'CIE sections={len(cie_data["sections"])}, subtopics={cie_data["total_subtopics"]}')
    print(f'EDX sections={len(edx_data["sections"])}, subtopics={edx_data["total_subtopics"]}')
    print(f'Link rows={len(merged_links)}')


if __name__ == '__main__':
    main()
