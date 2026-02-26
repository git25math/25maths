document.addEventListener('DOMContentLoaded', () => {
    // --- Check for necessary data and elements ---
    if (typeof exerciseData === 'undefined' || !exerciseData) {
        console.error('Exercise data is not defined. Make sure it is available in the page.');
        return;
    }

    const exerciseEngine = document.getElementById('exercise-engine');
    if (!exerciseEngine) {
        console.error('Exercise engine container not found.');
        return;
    }

    // --- DOM Elements ---
    const questionContainer = document.getElementById('question-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const submitBtn = document.getElementById('submit-answer-btn');
    const nextBtn = document.getElementById('next-question-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressLabel = document.getElementById('progress-label');
    const scoreLabel = document.getElementById('score-label');
    const progressBar = document.getElementById('progress-bar');
    const previousExerciseLinkSlot = document.getElementById('previous-exercise-link-slot');
    const nextExerciseLinkSlot = document.getElementById('next-exercise-link-slot');

    // --- State ---
    const questions = exerciseData.questions || [];
    const links = (typeof exerciseLinks !== 'undefined' && exerciseLinks) ? exerciseLinks : null;
    const topicSlugFromPage = (typeof exerciseTopicSlug === 'string' && exerciseTopicSlug) ? exerciseTopicSlug : '';
    const boardSlugFromPage = (typeof exerciseBoardSlug === 'string' && exerciseBoardSlug) ? exerciseBoardSlug : '';
    const boardDirectoryUrl = (typeof exerciseBoardDirectoryUrl === 'string' && exerciseBoardDirectoryUrl) ? exerciseBoardDirectoryUrl : '/kahoot/';
    const boardDirectoryLabel = (typeof exerciseBoardDirectoryLabel === 'string' && exerciseBoardDirectoryLabel) ? exerciseBoardDirectoryLabel : 'Kahoot Directory';
    const exercisesHubUrl = (typeof exerciseHubUrl === 'string' && exerciseHubUrl) ? exerciseHubUrl : '/exercises/';
    const laneItems = Array.isArray(exerciseLane) ? exerciseLane : [];
    const currentSubtopicId = (typeof exerciseCurrentSubtopicId === 'string' && exerciseCurrentSubtopicId)
        ? exerciseCurrentSubtopicId
        : '';
    const exerciseMeta = (typeof exerciseMetaData === 'object' && exerciseMetaData)
        ? exerciseMetaData
        : null;
    const topicSlug = exerciseEngine.dataset.topic || topicSlugFromPage;
    const boardSlug = boardSlugFromPage || resolveBoardSlug();
    const completionThemeClass = (boardSlug === 'cie0580')
        ? 'exercise-completion-actions--cie'
        : (boardSlug === 'edexcel-4ma1')
            ? 'exercise-completion-actions--edx'
            : 'exercise-completion-actions--neutral';
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswer = null;
    let previousExercise = null;
    let nextExercise = null;
    const exerciseStartedAtMs = Date.now();
    let cloudSupabaseClient = null;
    let cloudUserId = '';
    let cloudSessionId = '';
    let cloudSessionCompleted = false;

    function resolveBoardSlug() {
        if (currentSubtopicId && currentSubtopicId.includes(':')) {
            return String(currentSubtopicId).split(':')[0];
        }
        if (exerciseMeta && exerciseMeta.board) {
            return String(exerciseMeta.board).trim().toLowerCase().replace(/\s+/g, '-');
        }
        return '';
    }

    function resolveTierSlug() {
        if (exerciseMeta && exerciseMeta.tier) {
            return String(exerciseMeta.tier).trim().toLowerCase();
        }
        return '';
    }

    function resolveExerciseSlug() {
        if (topicSlug) return String(topicSlug);
        if (currentSubtopicId) return String(currentSubtopicId).replace(/:/g, '-');
        return String(window.location.pathname || '').replace(/^\//, '').replace(/\/$/, '');
    }

    function resolveSkillTag(question, questionIndex) {
        if (question && typeof question.skillTag === 'string' && question.skillTag.trim()) {
            return question.skillTag.trim();
        }
        if (exerciseMeta && exerciseMeta.syllabusCode) {
            return String(exerciseMeta.syllabusCode).trim().toLowerCase();
        }
        if (topicSlug) {
            return String(topicSlug).trim().toLowerCase();
        }
        return `q-${questionIndex + 1}`;
    }

    function getCloudDurationSeconds() {
        return Math.max(0, Math.round((Date.now() - exerciseStartedAtMs) / 1000));
    }

    async function getCloudAccessToken() {
        if (!cloudSupabaseClient) {
            return '';
        }
        const { data, error } = await cloudSupabaseClient.auth.getSession();
        if (error || !data || !data.session || !data.session.access_token) {
            return '';
        }
        return String(data.session.access_token).trim();
    }

    async function postExerciseApi(path, payload) {
        const accessToken = await getCloudAccessToken();
        if (!accessToken) {
            return { ok: false, status: 401, data: null };
        }
        try {
            const response = await fetch(path, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${accessToken}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            let data = null;
            try {
                data = await response.json();
            } catch (error) {
                data = null;
            }
            return { ok: response.ok, status: response.status, data };
        } catch (error) {
            return { ok: false, status: 0, data: null };
        }
    }

    async function initializeCloudSession() {
        if (cloudSessionId || cloudSessionCompleted) {
            return;
        }

        const client = window.memberSupabase;
        if (!client) {
            return;
        }

        cloudSupabaseClient = client;
        const { data: userData, error: userError } = await cloudSupabaseClient.auth.getUser();
        if (userError || !userData || !userData.user) {
            return;
        }

        cloudUserId = userData.user.id;
        const insertPayload = {
            exercise_slug: resolveExerciseSlug(),
            board: resolveBoardSlug(),
            tier: resolveTierSlug(),
            syllabus_code: (exerciseMeta && exerciseMeta.syllabusCode) ? exerciseMeta.syllabusCode : '',
            started_at: new Date(exerciseStartedAtMs).toISOString(),
        };

        const apiResult = await postExerciseApi('/api/v1/exercise/session/start', insertPayload);
        if (apiResult.ok && apiResult.data && apiResult.data.session_id) {
            cloudSessionId = String(apiResult.data.session_id);
            return;
        }

        const { data: sessionData, error: sessionError } = await cloudSupabaseClient
            .from('exercise_sessions')
            .insert({
                user_id: cloudUserId,
                ...insertPayload,
            })
            .select('id')
            .single();

        if (sessionError || !sessionData || !sessionData.id) {
            cloudSessionId = '';
            return;
        }
        cloudSessionId = sessionData.id;
    }

    async function persistCloudAttempt(question, answerIndex, isCorrect) {
        if (!cloudSupabaseClient || !cloudUserId || !cloudSessionId || cloudSessionCompleted) {
            return;
        }

        const attemptPayload = {
            question_index: currentQuestionIndex,
            is_correct: Boolean(isCorrect),
            selected_answer: Number.isInteger(answerIndex) ? answerIndex : null,
            correct_answer: Number.isInteger(question.correctAnswer) ? question.correctAnswer : null,
            skill_tag: resolveSkillTag(question, currentQuestionIndex),
        };

        const apiResult = await postExerciseApi(`/api/v1/exercise/session/${encodeURIComponent(cloudSessionId)}/attempt`, attemptPayload);
        if (apiResult.ok) {
            return;
        }

        const { error } = await cloudSupabaseClient
            .from('question_attempts')
            .insert({
                session_id: cloudSessionId,
                user_id: cloudUserId,
                ...attemptPayload,
            });
        if (error) {
            // Keep exercise flow running even if cloud logging fails.
        }
    }

    async function completeCloudSession() {
        if (!cloudSupabaseClient || !cloudSessionId || cloudSessionCompleted) {
            return;
        }

        cloudSessionCompleted = true;
        const updatePayload = {
            score,
            question_count: questions.length,
            duration_seconds: getCloudDurationSeconds(),
        };

        const apiResult = await postExerciseApi(`/api/v1/exercise/session/${encodeURIComponent(cloudSessionId)}/complete`, updatePayload);
        if (apiResult.ok) {
            // Dispatch engagement events if API returned achievement/streak data
            if (apiResult.data) {
                dispatchEngagementEvents(apiResult.data);
            }
            return;
        }

        const { error } = await cloudSupabaseClient
            .from('exercise_sessions')
            .update({
                completed_at: new Date().toISOString(),
                ...updatePayload,
            })
            .eq('id', cloudSessionId)
            .eq('user_id', cloudUserId);
        if (error) {
            cloudSessionCompleted = false;
        }
    }

    function dispatchEngagementEvents(responseData) {
        const newlyUnlocked = responseData.newly_unlocked;
        const levelUp = responseData.level_up;

        if ((Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) || levelUp) {
            window.dispatchEvent(new CustomEvent('achievement-unlocked', {
                detail: {
                    newly_unlocked: newlyUnlocked || [],
                    level_up: Boolean(levelUp),
                    level_info: levelUp ? {
                        level: responseData.level,
                        title: `Level ${responseData.level}`,
                    } : null,
                    xp_earned: responseData.xp_earned || 0,
                    total_xp: responseData.total_xp || 0,
                },
            }));
        }

        if (responseData.streak) {
            window.dispatchEvent(new CustomEvent('streak-updated', {
                detail: responseData.streak,
            }));
        }
    }

    function escapeHtml(rawValue) {
        return String(rawValue ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeInlineMath(rawValue) {
        const value = String(rawValue ?? '');
        return value.replace(/\$([^$]+)\$/g, (match, content) => {
            const trimmed = String(content || '').trim();
            if (!trimmed) return match;
            // Convert LaTeX-like $...$ to \( ... \) while ignoring currency-like values.
            if (!/[\\^_{}]/.test(trimmed)) return match;
            return `\\(${trimmed}\\)`;
        });
    }

    function renderMath(container) {
        if (!container || typeof window.renderMathInElement !== 'function') {
            return;
        }
        try {
            window.renderMathInElement(container, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '\\[', right: '\\]', display: true },
                    { left: '\\(', right: '\\)', display: false },
                ],
                throwOnError: false,
                strict: 'ignore',
            });
        } catch (error) {
            // Keep question flow running even if formula rendering fails.
        }
    }

    function withTrackingUrl(rawUrl, actionKey) {
        if (!rawUrl) {
            return '';
        }
        try {
            const parsed = new URL(rawUrl, window.location.origin);
            if (!parsed.searchParams.has('src_page')) {
                parsed.searchParams.set('src_page', 'interactive_exercise');
            }
            if (topicSlug) {
                parsed.searchParams.set('exercise_topic', topicSlug);
            }
            parsed.searchParams.set('exercise_action', actionKey);
            return parsed.toString();
        } catch (error) {
            return rawUrl;
        }
    }

    function attachTrackingToVisibleLinks() {
        document.querySelectorAll('[data-track-action]').forEach((anchor) => {
            const actionKey = anchor.getAttribute('data-track-action') || 'resource';
            const href = anchor.getAttribute('href');
            if (!href) {
                return;
            }
            anchor.setAttribute('href', withTrackingUrl(href, actionKey));
        });
    }

    function parseSyllabusCode(code) {
        const normalized = String(code || '').trim();
        const match = /^([A-Za-z])(\d+)-(\d+)$/.exec(normalized);
        if (!match) {
            return null;
        }
        return {
            tierLetter: match[1].toUpperCase(),
            sectionNo: Number(match[2]),
            itemNo: Number(match[3]),
        };
    }

    function compareLaneItems(a, b) {
        const aParsed = parseSyllabusCode(a.code);
        const bParsed = parseSyllabusCode(b.code);
        if (aParsed && bParsed) {
            if (aParsed.tierLetter !== bParsed.tierLetter) {
                return aParsed.tierLetter.localeCompare(bParsed.tierLetter);
            }
            if (aParsed.sectionNo !== bParsed.sectionNo) {
                return aParsed.sectionNo - bParsed.sectionNo;
            }
            if (aParsed.itemNo !== bParsed.itemNo) {
                return aParsed.itemNo - bParsed.itemNo;
            }
        } else if (aParsed && !bParsed) {
            return -1;
        } else if (!aParsed && bParsed) {
            return 1;
        }
        const codeCompare = String(a.code || '').localeCompare(String(b.code || ''));
        if (codeCompare !== 0) {
            return codeCompare;
        }
        return String(a.subtopic_id || '').localeCompare(String(b.subtopic_id || ''));
    }

    function resolvePreviousExercise() {
        if (!laneItems.length || !currentSubtopicId) {
            return null;
        }
        const sortedLane = laneItems.slice().sort(compareLaneItems);
        const currentIndex = sortedLane.findIndex((item) => item.subtopic_id === currentSubtopicId);
        if (currentIndex <= 0) {
            return null;
        }
        return sortedLane[currentIndex - 1];
    }

    function resolveNextExercise() {
        if (!laneItems.length || !currentSubtopicId) {
            return null;
        }
        const sortedLane = laneItems.slice().sort(compareLaneItems);
        const currentIndex = sortedLane.findIndex((item) => item.subtopic_id === currentSubtopicId);
        if (currentIndex < 0 || currentIndex + 1 >= sortedLane.length) {
            return null;
        }
        return sortedLane[currentIndex + 1];
    }

    function buildSyllabusButtonHtml(exerciseItem, direction) {
        const isPrevious = direction === 'previous';
        const baseLabel = isPrevious ? 'Previous in Syllabus' : 'Next in Syllabus';
        if (!exerciseItem || !exerciseItem.url) {
            return `<span class="loop-btn-base loop-btn-primary loop-btn-disabled">${baseLabel}</span>`;
        }
        const actionKey = isPrevious ? 'previous_exercise' : 'next_exercise';
        const label = exerciseItem.code ? `${baseLabel} (${exerciseItem.code})` : baseLabel;
        const href = escapeHtml(withTrackingUrl(exerciseItem.url, actionKey));
        const safeLabel = escapeHtml(label);
        return `<a href="${href}" class="loop-btn-base loop-btn-primary">${safeLabel}</a>`;
    }

    function injectSyllabusNavigationLinks() {
        if (previousExerciseLinkSlot) {
            previousExerciseLinkSlot.innerHTML = buildSyllabusButtonHtml(previousExercise, 'previous');
        }
        if (nextExerciseLinkSlot) {
            nextExerciseLinkSlot.innerHTML = buildSyllabusButtonHtml(nextExercise, 'next');
        }
    }

    function buildRowButtonHtml(href, label, buttonClass, actionKey, openInNewTab) {
        const safeLabel = escapeHtml(label);
        if (!href) {
            return `<span class="loop-btn-base ${buttonClass} loop-btn-disabled">${safeLabel}</span>`;
        }
        const trackedHref = escapeHtml(withTrackingUrl(href, actionKey || 'resource'));
        const targetAttrs = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${trackedHref}"${targetAttrs} class="loop-btn-base ${buttonClass}">${safeLabel}</a>`;
    }

    function persistLastExercise() {
        if (!exerciseMeta || typeof window === 'undefined' || !window.localStorage) {
            return;
        }
        const payload = {
            url: `${window.location.pathname}${window.location.search || ''}`,
            title: exerciseMeta.title || document.title || '',
            subtitle: exerciseMeta.subtitle || '',
            board: exerciseMeta.board || '',
            tier: exerciseMeta.tier || '',
            syllabusCode: exerciseMeta.syllabusCode || '',
            updatedAt: new Date().toISOString(),
        };
        try {
            window.localStorage.setItem('lastInteractiveExerciseV1', JSON.stringify(payload));
        } catch (error) {
            // Ignore localStorage write errors.
        }
    }

    function buildCompletionActionsHtml() {
        const tryAnotherHref = exercisesHubUrl || '/exercises/';
        const backLabel = boardDirectoryLabel ? `Back to ${boardDirectoryLabel}` : 'Back to Kahoot Directory';
        const bundleUrl = (links && typeof links === 'object')
            ? (links.bundle_url || links.section_bundle_payhip_url || links.unit_bundle_payhip_url || '')
            : '';
        const kahootUrl = (links && typeof links === 'object' && links.kahoot_url) ? links.kahoot_url : '';
        const worksheetUrl = (links && typeof links === 'object' && links.worksheet_payhip_url) ? links.worksheet_payhip_url : '';

        return `
            <div class="exercise-completion-actions ${completionThemeClass} mt-5 border-t border-blue-200 pt-4">
                <p class="text-sm font-semibold text-blue-900">Next step for this micro-topic</p>
                <div class="mt-3 space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${buildSyllabusButtonHtml(previousExercise, 'previous')}
                        ${buildSyllabusButtonHtml(nextExercise, 'next')}
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        ${buildRowButtonHtml(tryAnotherHref, 'Try Another Interactive Exercise', 'loop-btn-soft exercise-warm-primary', 'try_another', false)}
                        ${buildRowButtonHtml(boardDirectoryUrl, backLabel, 'loop-btn-soft', 'board_directory', false)}
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        ${buildRowButtonHtml(kahootUrl, 'Playing Matching Kahoot', 'loop-btn-kahoot exercise-kahoot-bridge', 'kahoot_complete', true)}
                        ${buildRowButtonHtml(worksheetUrl, 'Get Matching Worksheet', 'loop-btn-soft', 'worksheet_complete', true)}
                        ${buildRowButtonHtml(bundleUrl, 'Explore Bundle', 'loop-btn-soft', 'bundle_complete', true)}
                    </div>
                </div>
            </div>
        `;
    }

    function updateProgressUi() {
        if (!progressLabel || !scoreLabel || !progressBar) {
            return;
        }
        const total = questions.length || 1;
        const current = Math.min(currentQuestionIndex + 1, total);
        const completed = Math.min(currentQuestionIndex, total);
        const ratio = Math.max(0, Math.min(1, completed / total));

        progressLabel.textContent = `Question ${current} / ${total}`;
        scoreLabel.textContent = `Score: ${score}`;
        progressBar.style.width = `${Math.round(ratio * 100)}%`;
    }

    /**
     * Renders the current question and its options.
     * @param {number} index - The index of the question to render.
     */
    function renderQuestion(index) {
        const question = questions[index];
        const questionText = escapeHtml(normalizeInlineMath(question.questionText || ''));
        let optionsHtml = '';

        if (question.type === 'multiple-choice') {
            optionsHtml = '<div class="space-y-3">';
            question.options.forEach((option, i) => {
                const optionLabel = escapeHtml(normalizeInlineMath(option));
                optionsHtml += `
                    <div>
                        <label class="block border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-100 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-500">
                            <input type="radio" name="answer" value="${i}" class="sr-only">
                            <span class="font-mono text-sm mr-4 text-gray-500">${String.fromCharCode(65 + i)}</span>
                            <span>${optionLabel}</span>
                        </label>
                    </div>
                `;
            });
            optionsHtml += '</div>';
        }
        // TODO: Add rendering for other question types like 'fill-in-the-blank'.

        questionContainer.innerHTML = `
            <p class="text-lg font-semibold">${index + 1}. ${questionText}</p>
            <div class="mt-4">${optionsHtml}</div>
        `;
        renderMath(questionContainer);
        updateProgressUi();

        // Reset state for the new question
        selectedAnswer = null;
        feedbackContainer.innerHTML = '';
        submitBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
        nextBtn.disabled = true;
        nextBtn.classList.add('bg-gray-400');
        nextBtn.classList.remove('bg-primary');

        // Add event listeners for new radio buttons
        document.querySelectorAll('input[name="answer"]').forEach((radio) => {
            radio.addEventListener('change', (event) => {
                selectedAnswer = parseInt(event.target.value, 10);
            });
        });
    }

    /**
     * Handles the answer submission.
     */
    function handleSubmit() {
        if (selectedAnswer === null) {
            feedbackContainer.innerHTML = '<p class="text-red-600 font-semibold">Please select an answer.</p>';
            return;
        }

        const question = questions[currentQuestionIndex];
        const isCorrect = (selectedAnswer === question.correctAnswer);
        const explanationHtml = escapeHtml(question.explanation || '');
        const submittedAnswer = selectedAnswer;

        if (isCorrect) {
            score++;
            feedbackContainer.innerHTML = `
                <div class="p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg">
                    <p class="font-bold">Correct!</p>
                    <p class="mt-2">${explanationHtml}</p>
                </div>
            `;
        } else {
            feedbackContainer.innerHTML = `
                <div class="p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
                    <p class="font-bold">Incorrect.</p>
                    <p class="mt-2">${explanationHtml}</p>
                </div>
            `;
        }
        void persistCloudAttempt(question, submittedAnswer, isCorrect);
        updateProgressUi();

        // Disable radio buttons after submission
        document.querySelectorAll('input[name="answer"]').forEach((radio) => {
            radio.disabled = true;
        });

        // Update button states
        submitBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        nextBtn.disabled = false;
        nextBtn.classList.remove('bg-gray-400');
        nextBtn.classList.add('bg-primary');
    }

    /**
     * Handles moving to the next question or finishing the exercise.
     */
    function handleNext() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            renderQuestion(currentQuestionIndex);
        } else {
            void completeCloudSession();
            // End of exercise
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
            questionContainer.innerHTML = '';
            feedbackContainer.innerHTML = `
                <div class="text-center p-6 bg-blue-50 rounded-lg">
                    <h2 class="text-2xl font-bold">Exercise Complete!</h2>
                    <p class="text-lg mt-2">You scored ${score} out of ${questions.length}.</p>
                    ${buildCompletionActionsHtml()}
                </div>
            `;
            submitBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }

    /**
     * Initializes the exercise.
     */
    function initializeExercise() {
        persistLastExercise();
        void initializeCloudSession();
        previousExercise = resolvePreviousExercise();
        nextExercise = resolveNextExercise();
        injectSyllabusNavigationLinks();
        attachTrackingToVisibleLinks();
        if (questions.length === 0) {
            questionContainer.innerHTML = '<p class="text-gray-600">No questions found for this topic.</p>';
            submitBtn.style.display = 'none';
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
            return;
        }
        if (progressContainer) {
            progressContainer.style.display = '';
        }
        renderQuestion(currentQuestionIndex);
    }

    // --- Event Listeners ---
    submitBtn.addEventListener('click', handleSubmit);
    nextBtn.addEventListener('click', handleNext);
    window.addEventListener('member-auth-change', (event) => {
        const isAuthenticated = Boolean(event && event.detail && event.detail.isAuthenticated);
        if (isAuthenticated) {
            void initializeCloudSession();
            return;
        }
        cloudUserId = '';
        cloudSessionId = '';
        cloudSessionCompleted = false;
    });

    // --- Initial Load ---
    initializeExercise();
});
