-- Achievement definitions seed data
-- Run after: 20260227000000_engagement_system.sql
-- Spec: plan/specs/STREAK-ACHIEVEMENT-SYSTEM.md §7

insert into public.achievement_definitions
  (id, title_en, title_cn, description_en, description_cn, icon, tier, category, criteria, xp_reward, sort_order)
values
  -- Streak achievements
  ('streak-3', '3-Day Streak', '三天连续', 'Practice 3 days in a row', '连续练习3天', '🔥', 'bronze', 'streak', '{"type":"streak","min_days":3}', 15, 1),
  ('streak-7', 'Week Warrior', '一周勇士', 'Practice 7 days in a row', '连续练习7天', '🔥', 'bronze', 'streak', '{"type":"streak","min_days":7}', 30, 2),
  ('streak-14', 'Fortnight Fighter', '两周战士', 'Practice 14 days in a row', '连续练习14天', '🔥', 'silver', 'streak', '{"type":"streak","min_days":14}', 50, 3),
  ('streak-30', 'Monthly Maven', '月度达人', 'Practice 30 days in a row', '连续练习30天', '🔥', 'gold', 'streak', '{"type":"streak","min_days":30}', 100, 4),
  ('streak-60', 'Two Month Titan', '双月勇者', 'Practice 60 days in a row', '连续练习60天', '🔥', 'gold', 'streak', '{"type":"streak","min_days":60}', 150, 5),
  ('streak-100', 'Century Club', '百日突破', 'Practice 100 days in a row', '连续练习100天', '🔥', 'diamond', 'streak', '{"type":"streak","min_days":100}', 250, 6),

  -- Volume achievements
  ('volume-10', 'Getting Started', '初出茅庐', 'Complete 10 practice sessions', '完成10次练习', '📚', 'bronze', 'volume', '{"type":"volume","min_sessions":10}', 15, 10),
  ('volume-50', 'Dedicated Learner', '勤学好问', 'Complete 50 practice sessions', '完成50次练习', '📚', 'silver', 'volume', '{"type":"volume","min_sessions":50}', 30, 11),
  ('volume-100', 'Century Practitioner', '百炼成钢', 'Complete 100 practice sessions', '完成100次练习', '📚', 'gold', 'volume', '{"type":"volume","min_sessions":100}', 75, 12),
  ('volume-500', 'Relentless', '坚持不懈', 'Complete 500 practice sessions', '完成500次练习', '📚', 'diamond', 'volume', '{"type":"volume","min_sessions":500}', 200, 13),

  -- Accuracy achievements
  ('accuracy-80-5', 'Sharp Shooter', '神射手', 'Score 80%+ on 5 sessions', '5次练习得分超过80%', '🎯', 'bronze', 'accuracy', '{"type":"accuracy","min_pct":80,"min_sessions":5}', 20, 20),
  ('accuracy-90-10', 'Precision Player', '精准玩家', 'Score 90%+ on 10 sessions', '10次练习得分超过90%', '🎯', 'silver', 'accuracy', '{"type":"accuracy","min_pct":90,"min_sessions":10}', 50, 21),
  ('accuracy-100-5', 'Perfectionist', '完美主义者', 'Score 100% on 5 sessions', '5次练习满分', '🎯', 'gold', 'accuracy', '{"type":"accuracy","min_pct":100,"min_sessions":5}', 100, 22),

  -- Explorer achievements
  ('explorer-5', 'Curious Mind', '好奇宝宝', 'Practice in 5 different topics', '练习5个不同主题', '🗺️', 'bronze', 'explorer', '{"type":"explorer","min_topics":5}', 20, 30),
  ('explorer-15', 'Wide Learner', '博学多才', 'Practice in 15 different topics', '练习15个不同主题', '🗺️', 'silver', 'explorer', '{"type":"explorer","min_topics":15}', 50, 31),
  ('explorer-all', 'Completionist', '全能选手', 'Practice every available topic', '练习所有可用主题', '🗺️', 'diamond', 'explorer', '{"type":"explorer","min_topics":999}', 300, 32),

  -- Speed achievements
  ('speed-5min', 'Quick Thinker', '思维敏捷', 'Complete a session under 5 min with 80%+', '5分钟内完成练习且正确率80%+', '⚡', 'silver', 'speed', '{"type":"speed","max_seconds":300,"min_pct":80}', 40, 40),
  ('speed-3min', 'Lightning Fast', '闪电速度', 'Complete a session under 3 min with 90%+', '3分钟内完成练习且正确率90%+', '⚡', 'gold', 'speed', '{"type":"speed","max_seconds":180,"min_pct":90}', 75, 41),

  -- Improvement achievements
  ('improve-20', 'Comeback Kid', '逆袭达人', 'Improve accuracy 20%+ on a weak skill', '在薄弱技能上提高20%+正确率', '📈', 'gold', 'improvement', '{"type":"improvement","min_delta":20}', 75, 50),
  ('improve-first', 'First Victory', '首次突破', 'Get a previously weak topic above 70%', '将之前的弱项提升到70%以上', '📈', 'silver', 'improvement', '{"type":"improvement","min_delta":10,"target_pct":70}', 40, 51)
on conflict (id) do nothing;
