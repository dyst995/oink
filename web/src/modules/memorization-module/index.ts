export { FretboardTrainer } from './FretboardTrainer.tsx'
export { canBuildSession, generateQuestions } from './generate.ts'
export {
  NOTE_NAMES,
  allPositions,
  noteNameFromPitchClass,
  parseNoteAnswer,
  positionAt,
} from './notes.ts'
export {
  advanceSession,
  createIdleSession,
  endSession,
  gradeAnswer,
  sessionStats,
  startSession,
} from './session.ts'
export { validateAnswer } from './validate.ts'
export type {
  AnswerPayload,
  AnswerResult,
  ExerciseMode,
  TrainerConfig,
  TrainerQuestion,
  TrainerSession,
} from './types.ts'
