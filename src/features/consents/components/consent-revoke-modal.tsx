'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useMemo, useState } from 'react';

interface UserSuggestion {
  id: string;
  email: string;
}

interface ConsentRevokeModalProps {
  isOpen: boolean;
  clientId: string | null;
  onClose: () => void;
}

export function ConsentRevokeModal({ isOpen, clientId, onClose }: ConsentRevokeModalProps) {
  const [subjectOrEmail, setSubjectOrEmail] = useState('');
  const [subject, setSubject] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);

  const filteredSuggestions = useMemo(
    () => suggestions.filter((item) => item.email),
    [suggestions],
  );

  useEffect(() => {
    if (!isOpen) {
      setSubjectOrEmail('');
      setIsSubmitting(false);
      setError(null);
      setSuccess(null);
      setSuggestions([]);
      setIsSuggesting(false);
      setSuppressSuggestions(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const query = subjectOrEmail.trim();
    if (!isOpen || suppressSuggestions || query.length < 2) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setIsSuggesting(true);
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          setSuggestions([]);
          return;
        }
        const data = (await response.json()) as UserSuggestion[];
        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [subjectOrEmail, isOpen]);

  if (!isOpen || !clientId) return null;

  const handleSubmit = async () => {
    if (!subject?.trim()) {
      setError('Please enter a user email or subject.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          client: clientId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to revoke consent');
      }

      const resolved = data.subject;
      setSuccess(`Consent revoked for ${resolved} on client ${clientId}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke consent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Revoke Remembered Consent
        </h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Enter a user email (preferred) or the Hydra subject to revoke consent for this client.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              User Email or Subject
            </label>
            <Input
              value={subjectOrEmail}
              onChange={(event) => {
                setSubjectOrEmail(event.target.value);
                setSuppressSuggestions(false);
              }}
              placeholder="user@example.com or subject-id"
              autoComplete="off"
            />
            {isSuggesting && (
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Searching...</div>
            )}
            {filteredSuggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    onClick={() => {
                      setSubjectOrEmail(suggestion.email);
                      setSubject(suggestion.id);
                      setSuggestions([]);
                      setSuppressSuggestions(true);
                    }}
                  >
                    <span>{suggestion.email}</span>
                    <span className="ml-3 font-mono text-xs text-zinc-400">{suggestion.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
              {success}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Revoking...' : 'Revoke Consent'}
          </Button>
        </div>
      </div>
    </div>
  );
}
