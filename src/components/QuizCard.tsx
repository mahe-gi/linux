'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '@/types/course';
import { saveQuizScore } from '@/lib/course-store';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Award } from 'lucide-react';

interface QuizCardProps {
  moduleId: string;
  questions: QuizQuestion[];
  onQuizComplete?: (scorePercent: number) => void;
}

export function QuizCard({ moduleId, questions, onQuizComplete }: QuizCardProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleGradeQuiz = () => {
    let correctCount = 0;
    for (const q of questions) {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    }

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    setSubmitted(true);
    saveQuizScore(moduleId, scorePercent);

    if (scorePercent >= 80) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Fallback
      }
    }

    if (onQuizComplete) {
      onQuizComplete(scorePercent);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isComplete = answeredCount === questions.length;

  const calculateScore = () => {
    let correct = 0;
    for (const q of questions) {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    }
    return {
      correct,
      total: questions.length,
      percent: Math.round((correct / questions.length) * 100),
    };
  };

  const score = submitted ? calculateScore() : null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HelpCircle className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-100">Module Knowledge Check</h3>
            <p className="text-xs text-slate-400">
              Verify your comprehension with practical scenarios ({questions.length} questions)
            </p>
          </div>
        </div>

        {submitted && score && (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                score.percent >= 80
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              Score: {score.correct} / {score.total} ({score.percent}%)
            </span>
            <button
              onClick={handleResetQuiz}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
              title="Retake Quiz"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Retake</span>
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const userChoice = selectedAnswers[q.id];
          const isGraded = submitted;
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-4 rounded-xl border transition ${
                isGraded
                  ? isCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-red-950/20 border-red-500/30'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold shrink-0 mt-0.5">
                  {qIndex + 1}
                </span>
                <div className="space-y-3 flex-1">
                  <h4 className="text-sm font-semibold text-slate-100">{q.question}</h4>

                  {q.codeSnippet && (
                    <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
                      {q.codeSnippet}
                    </pre>
                  )}

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = userChoice === optIndex;
                      const isThisOptionCorrect = q.correctIndex === optIndex;

                      let optionStyle =
                        'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700';

                      if (isGraded) {
                        if (isThisOptionCorrect) {
                          optionStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-medium';
                        } else if (isSelected && !isThisOptionCorrect) {
                          optionStyle = 'bg-red-950/60 border-red-500/60 text-red-200';
                        } else {
                          optionStyle = 'bg-slate-900/40 border-slate-900 text-slate-500 opacity-60';
                        }
                      } else if (isSelected) {
                        optionStyle = 'bg-blue-600/20 border-blue-500 text-blue-200 font-medium';
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleSelect(q.id, optIndex)}
                          disabled={submitted}
                          className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full border border-current/40 flex items-center justify-center text-[10px] shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isGraded && (
                            <div>
                              {isThisOptionCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                              {isSelected && !isThisOptionCorrect && (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {isGraded && (
                    <div className="mt-3 p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-300">
                      <span className="font-semibold text-cyan-400 block mb-0.5">Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grade Button */}
      {!submitted && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Answered {answeredCount} of {questions.length} questions
          </p>
          <button
            onClick={handleGradeQuiz}
            disabled={!isComplete}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-xs transition font-sans ${
              isComplete
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Submit Quiz & View Explanations</span>
          </button>
        </div>
      )}
    </div>
  );
}
