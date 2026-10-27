"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  Mic,
  MicOff,
  Send,
  Square,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FeedbackPanel } from "@/components/interview/feedback-panel";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { useCountdown } from "@/hooks/use-countdown";
import { cn, formatDuration } from "@/lib/utils";
import type { QuestionFeedback } from "@/lib/interview/schema";

export interface SessionQuestion {
  id: string;
  order: number;
  question: string;
  category: string;
  answer?: string | null;
}

export interface InterviewSessionData {
  id: string;
  role: string;
  experienceLevel: string;
  interviewType: string;
  questionCount: number;
  status: string;
}

/**
 * The live mock interview.
 *
 * Flow: ask → answer (typing or voice) → instant feedback → next question.
 * The interview ends when the requested number of questions has been asked.
 */
export function InterviewSession({
  session,
  initialQuestion,
}: {
  session: InterviewSessionData;
  initialQuestion: SessionQuestion | null;
}) {
  const router = useRouter();

  const [question, setQuestion] = React.useState<SessionQuestion | null>(initialQuestion);
  const [answer, setAnswer] = React.useState("");
  const [feedback, setFeedback] = React.useState<QuestionFeedback | null>(null);
  const [loadingQuestion, setLoadingQuestion] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [finishing, setFinishing] = React.useState(false);
  const [demo, setDemo] = React.useState(false);
  const [intent, setIntent] = React.useState("");
  const [asked, setAsked] = React.useState(initialQuestion ? 1 : 0);

  // Optional per-question timer (2 minutes is a realistic interview answer).
  const [timerEnabled, setTimerEnabled] = React.useState(false);
  const TIMER_SECONDS = 120;
  const { remaining, elapsed, expired } = useCountdown(
    TIMER_SECONDS,
    question?.id ?? "none",
    timerEnabled && !feedback,
  );

  // Optional text-to-speech for the interviewer.
  const [speakEnabled, setSpeakEnabled] = React.useState(false);
  const tts = useSpeechSynthesis();

  // Speech-to-text.
  const stt = useSpeechRecognition({
    onTranscript: (transcript) =>
      setAnswer((current) => (current ? `${current} ${transcript}` : transcript)),
  });

  // Read the question aloud when speech mode is on.
  React.useEffect(() => {
    if (speakEnabled && question?.question && tts.supported) {
      tts.speak(question.question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.id, speakEnabled]);

  async function loadNextQuestion() {
    setLoadingQuestion(true);
    setFeedback(null);
    setAnswer("");
    setIntent("");

    try {
      const response = await fetch(`/api/interviews/${session.id}/question`, { method: "POST" });
      const payload = await response.json();

      if (response.status === 409 && payload.code === "ALL_QUESTIONS_ASKED") {
        await finishInterview();
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not load the next question.");
      }

      setQuestion(payload.question);
      setIntent(payload.intent ?? "");
      setDemo(Boolean(payload.demo));
      setAsked((count) => count + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load the next question.");
    } finally {
      setLoadingQuestion(false);
    }
  }

  async function submitAnswer() {
    if (!question) return;
    if (!answer.trim()) {
      toast.error("Write or dictate an answer first.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/interviews/${session.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answer,
          durationSeconds: timerEnabled ? elapsed : undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not score your answer.");
      }

      setFeedback(payload.feedback);
      setDemo(Boolean(payload.demo));
      tts.cancel();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not score your answer.");
    } finally {
      setSubmitting(false);
    }
  }

  async function finishInterview() {
    setFinishing(true);
    try {
      const response = await fetch(`/api/interviews/${session.id}/complete`, { method: "POST" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Could not build the report.");
      }
      router.push(`/interview/${session.id}/report`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build the report.");
      setFinishing(false);
    }
  }

  const progress = (asked / session.questionCount) * 100;
  const isLastQuestion = asked >= session.questionCount;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      {/* ------------------------------------------------------------ Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{session.role}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Question {asked} of {session.questionCount}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timer toggle */}
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Timer className="h-3.5 w-3.5" aria-hidden />
              Timer
              <Switch
                checked={timerEnabled}
                onCheckedChange={setTimerEnabled}
                aria-label="Enable per-question timer"
              />
            </label>

            {/* TTS toggle */}
            {tts.supported && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                {speakEnabled ? (
                  <Volume2 className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" aria-hidden />
                )}
                Read aloud
                <Switch
                  checked={speakEnabled}
                  onCheckedChange={setSpeakEnabled}
                  aria-label="Read questions aloud"
                />
              </label>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void finishInterview()}
              loading={finishing}
            >
              End &amp; get report
            </Button>
          </div>
        </div>

        <Progress value={progress} className="mt-4 h-1.5" />
      </div>

      {/* ---------------------------------------------------------- Question */}
      <Card className="relative overflow-hidden p-5 sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-soft blur-2xl"
        />

        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">
              AI
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Interviewer
            </span>
            {intent && (
              <Badge variant="secondary" className="ml-auto hidden sm:inline-flex">
                {intent}
              </Badge>
            )}
          </div>

          {loadingQuestion ? (
            <div className="mt-6 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              The interviewer is thinking…
            </div>
          ) : question ? (
            <p className="mt-5 font-display text-lg leading-relaxed sm:text-xl">{question.question}</p>
          ) : (
            <div className="mt-6 flex flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">
                Ready when you are — the interviewer will ask the first question.
              </p>
              <Button type="button" onClick={() => void loadNextQuestion()} loading={loadingQuestion}>
                Start the interview
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {tts.speaking && question && (
            <button
              type="button"
              onClick={tts.cancel}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Volume2 className="h-3.5 w-3.5 animate-pulse" aria-hidden />
              Speaking… (click to stop)
            </button>
          )}
        </div>
      </Card>

      {/* ------------------------------------------------------------ Answer */}
      {question && (
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Label htmlFor="answer" className="text-sm font-semibold">
              Your answer
            </Label>

            {timerEnabled && (
              <span
                className={cn(
                  "font-mono text-sm tabular-nums",
                  expired
                    ? "text-destructive"
                    : remaining <= 20
                      ? "text-warning"
                      : "text-muted-foreground",
                )}
              >
                {formatDuration(remaining)}
                {expired && " · time's up"}
              </span>
            )}
          </div>

          <Textarea
            id="answer"
            rows={7}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Use the STAR method for behavioural questions: Situation, Task, Action, Result…"
            className="text-[15px] leading-relaxed"
            disabled={Boolean(feedback)}
          />

          {/* Voice controls */}
          <div className="flex flex-wrap items-center gap-2">
            {stt.supported && (
              <Button
                type="button"
                variant={stt.listening ? "destructive" : "outline"}
                size="sm"
                onClick={() => (stt.listening ? stt.stop() : stt.start())}
                disabled={Boolean(feedback)}
              >
                {stt.listening ? (
                  <>
                    <Square className="h-3.5 w-3.5" aria-hidden />
                    Stop dictating
                  </>
                ) : (
                  <>
                    <Mic className="h-3.5 w-3.5" aria-hidden />
                    Answer with voice
                  </>
                )}
              </Button>
            )}

            {stt.listening && stt.interim && (
              <span className="text-xs italic text-muted-foreground">{stt.interim}</span>
            )}

            {stt.error && <span className="text-xs text-destructive">{stt.error}</span>}

            {!stt.supported && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MicOff className="h-3.5 w-3.5" aria-hidden />
                Voice input is not available in this browser — type your answer instead.
              </span>
            )}

            <div className="ml-auto">
              {!feedback ? (
                <Button type="button" onClick={() => void submitAnswer()} loading={submitting}>
                  {!submitting && <Send className="h-4 w-4" aria-hidden />}
                  {submitting ? "Scoring…" : "Submit answer"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => void loadNextQuestion()}
                  loading={loadingQuestion}
                >
                  {isLastQuestion ? "See my report" : "Next question"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------- Feedback */}
      {feedback && (
        <div className="mt-5">
          <FeedbackPanel feedback={feedback} demo={demo} />
        </div>
      )}

      {/* Demo-mode notice */}
      {demo && !feedback && (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Demo mode: questions come from a built-in bank. Add an{" "}
          <code className="font-semibold">ANTHROPIC_API_KEY</code> for real AI questions and feedback.
        </p>
      )}
    </div>
  );
}
