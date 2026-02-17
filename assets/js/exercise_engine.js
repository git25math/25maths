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
    const nextExerciseLinkSlot = document.getElementById('next-exercise-link-slot');

    // --- State ---
    const questions = exerciseData.questions || [];
    const links = (typeof exerciseLinks !== 'undefined' && exerciseLinks) ? exerciseLinks : null;
    const topicSlugFromPage = (typeof exerciseTopicSlug === 'string' && exerciseTopicSlug) ? exerciseTopicSlug : '';
    const laneItems = Array.isArray(exerciseLane) ? exerciseLane : [];
    const currentSubtopicId = (typeof exerciseCurrentSubtopicId === 'string' && exerciseCurrentSubtopicId)
        ? exerciseCurrentSubtopicId
        : '';
    const exerciseMeta = (typeof exerciseMetaData === 'object' && exerciseMetaData)
        ? exerciseMetaData
        : null;
    const topicSlug = exerciseEngine.dataset.topic || topicSlugFromPage;
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedAnswer = null;
    let nextExercise = null;

    function escapeHtml(rawValue) {
        return String(rawValue ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
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

    function injectNextExerciseLink() {
        if (!nextExerciseLinkSlot || !nextExercise || !nextExercise.url) {
            return;
        }
        const nextLabel = nextExercise.code
            ? `Next in Syllabus (${nextExercise.code})`
            : 'Next in Syllabus';
        const nextHref = escapeHtml(withTrackingUrl(nextExercise.url, 'next_exercise'));
        const nextLabelSafe = escapeHtml(nextLabel);
        nextExerciseLinkSlot.innerHTML = `
            <a href="${nextHref}" class="inline-flex items-center rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition">${nextLabelSafe}</a>
        `;
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
        const retryHref = escapeHtml(window.location.pathname);
        const actionButtons = [
            `<a href="${retryHref}" class="inline-flex items-center rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition">Retry This Exercise</a>`,
        ];
        if (nextExercise && nextExercise.url) {
            const nextLabel = nextExercise.code
                ? `Next in Syllabus (${nextExercise.code})`
                : 'Next in Syllabus';
            const nextHref = escapeHtml(withTrackingUrl(nextExercise.url, 'next_exercise'));
            const nextLabelSafe = escapeHtml(nextLabel);
            actionButtons.push(
                `<a href="${nextHref}" class="inline-flex items-center rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition">${nextLabelSafe}</a>`
            );
        }

        if (links && typeof links === 'object' && links.kahoot_url) {
            const kahootHref = escapeHtml(withTrackingUrl(links.kahoot_url, 'kahoot_complete'));
            actionButtons.push(
                `<a href="${kahootHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 transition">Play Matching Kahoot</a>`
            );
        }
        if (links && typeof links === 'object' && links.worksheet_payhip_url) {
            const worksheetHref = escapeHtml(withTrackingUrl(links.worksheet_payhip_url, 'worksheet_complete'));
            actionButtons.push(
                `<a href="${worksheetHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition">Get Matching Worksheet</a>`
            );
        }

        const bundleUrl = (links && typeof links === 'object')
            ? (links.bundle_url || links.section_bundle_payhip_url || links.unit_bundle_payhip_url || '')
            : '';
        if (bundleUrl) {
            const bundleHref = escapeHtml(withTrackingUrl(bundleUrl, 'bundle_complete'));
            actionButtons.push(
                `<a href="${bundleHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition">Explore Bundle</a>`
            );
        }

        return `
            <div class="mt-5 border-t border-blue-200 pt-4">
                <p class="text-sm font-semibold text-blue-900">Next step for this micro-topic</p>
                <div class="mt-3 flex flex-wrap justify-center gap-3">
                    ${actionButtons.join('')}
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
        const questionText = escapeHtml(question.questionText || '');
        let optionsHtml = '';

        if (question.type === 'multiple-choice') {
            optionsHtml = '<div class="space-y-3">';
            question.options.forEach((option, i) => {
                const optionLabel = escapeHtml(option);
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
        nextExercise = resolveNextExercise();
        injectNextExerciseLink();
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

    // --- Initial Load ---
    initializeExercise();
});
