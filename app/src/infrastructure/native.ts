import { NativeModule, requireOptionalNativeModule } from 'expo-modules-core';
import { Capture, SurveyMode } from '../domain/model';
export interface Capabilities { magnetic: boolean; relative: boolean; device: string; android: string }
export interface LiveSample {
  headingRad: number; pitchDeg: number; horizontalProjection: number; accuracy: number;
  stdDevDeg: number; sampleCount: number; ready: boolean; sessionId: string;
}
export interface LogSession { id: string; projectId: string; createdAt: string; status: string; bytes: number }
export interface Snapshot { token: string; sessionId: string; parts: number; uri: string; bytes: number }
type NativeEvents = {
  orientationSample: (sample: LiveSample) => void;
  sensorStatusChanged: (status: { status: string; message?: string; reason?: string }) => void;
};
declare class OrientationModule extends NativeModule<NativeEvents> {
  getCapabilities(): Promise<Capabilities>;
  startSession(options: string): Promise<{ sessionId: string; mode: SurveyMode }>;
  stopSession(): Promise<void>;
  captureDirection(): Promise<Capture>;
  appendEvent(type: string, payload: string): Promise<void>;
  listLogs(): Promise<LogSession[]>;
  deleteLog(id: string): Promise<void>;
  snapshotLog(id: string): Promise<Snapshot>;
  readLogPart(token: string, index: number): Promise<string>;
}
const module = requireOptionalNativeModule<OrientationModule>('FieldSketchOrientation');
export const orientation = () => {
  if (!module) throw new Error('Moduł pomiarowy wymaga APK FieldSketch lub development build. Expo Go nie jest obsługiwane.');
  return module;
};
