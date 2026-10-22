import { useTheme, Button } from './ui';
import React, { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { t } from '../i18n';
import type { Project } from '../domain/model';
import { useStore } from '../infrastructure/store';
import { Disclosure } from './presentation';
export function SketchNote({ project }: { project: Project }) {
  const { s } = useTheme();
  const store = useStore(), [note, setNote] = useState(project.note ?? '');
  useEffect(() => setNote(project.note ?? ''), [project.id, project.note]);
  return <Disclosure title={t("Notatka do szkicu")}><View style={{ gap: 10 }}>
    <TextInput accessibilityLabel={t("Notatka do szkicu")} multiline textAlignVertical="top" value={note}
      onChangeText={setNote} editable={!store.busy} style={[s.input, { minHeight: 120 }]} />
    <Button label={t("Zapisz notatkę")} secondary disabled={store.busy || note === (project.note ?? '')}
      onPress={() => store.run(async () => { await store.repo!.updateMetadata(project.id, { note }); await store.refresh(); })} />
  </View></Disclosure>;
}
