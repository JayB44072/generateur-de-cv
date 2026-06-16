import { useEffect, useRef, useState } from 'react';
import { supabase, CVContent } from '../lib/supabase';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave(
  userId: string | undefined,
  cvId: string | undefined,
  templateId: number,
  cvTitle: string,
  cvContent: CVContent,
  debounceMs = 1500,
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!userId || !cvId) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveStatus('saving');

    timerRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('cv_data')
          .update({ template_id: templateId, cv_title: cvTitle, cv_content: cvContent })
          .eq('id', cvId)
          .eq('user_id', userId);

        if (!isMounted.current) return;
        setSaveStatus(error ? 'error' : 'saved');

        if (!error) {
          setTimeout(() => {
            if (isMounted.current) setSaveStatus('idle');
          }, 2000);
        }
      } catch {
        if (isMounted.current) setSaveStatus('error');
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId, cvId, templateId, cvTitle, cvContent, debounceMs]);

  return saveStatus;
}
