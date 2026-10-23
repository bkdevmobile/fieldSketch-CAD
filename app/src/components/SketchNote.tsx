import { useTheme } from './ui';
import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { t } from '../i18n';
import type { Project } from '../domain/model';
import { useStore } from '../infrastructure/store';
import { Disclosure } from './presentation';
export function SketchNote({ project }: { project: Project }) {
  const { s } = useTheme();
  const store = useStore();
  const [draft, setDraft] = useState({ projectId: project.id, note: project.note ?? '' });
  const note = draft.projectId === project.id ? draft.note : (project.note ?? '');
  return <Disclosure title={t("Notatka do szkicu")}><View style={{ gap: 10 }}>
    <TextInput accessibilityLabel={t("Notatka do szkicu")} multiline textAlignVertical="top" value={note}
      onChangeText={value => {
        setDraft({ projectId: project.id, note: value });
        void store.updateProjectNote(project.id, value);
      }} editable={!store.busy} style={[s.input, { minHeight: 120 }]} />
  </View></Disclosure>;
}
