import { t } from '../i18n';
import React from 'react';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Page } from '../components/ui';
import { PlusDetails } from '../components/PlusOffer';

export default function Plus() {
  return <Page title="outlineGo Plus" footer={<Button label={t("Wróć")} icon={ArrowLeft} secondary onPress={() => router.back()} />}>
    <PlusDetails />
  </Page>;
}
