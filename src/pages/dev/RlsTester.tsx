import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Info,
  Loader2,
  PlayCircle,
  ArrowLeft,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StepResult {
  step: string;
  status: 'pass' | 'fail' | 'info';
  detail: string;
  data?: unknown;
}

interface TesterResponse {
  summary?: { passed: number; failed: number; total: number };
  results: StepResult[];
  error?: string;
}

const RlsTesterPage = () => {
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<TesterResponse | null>(null);

  const runTests = async () => {
    setRunning(true);
    setResponse(null);
    try {
      const { data, error } = await supabase.functions.invoke('rls-tester', {
        body: {},
      });
      if (error) throw error;
      setResponse(data as TesterResponse);
    } catch (err: any) {
      setResponse({
        results: [
          {
            step: 'Invoke rls-tester edge function',
            status: 'fail',
            detail: err.message || String(err),
          },
        ],
        error: err.message,
      });
    } finally {
      setRunning(false);
    }
  };

  const StatusIcon = ({ status }: { status: StepResult['status'] }) => {
    if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    if (status === 'fail') return <XCircle className="w-5 h-5 text-destructive shrink-0" />;
    return <Info className="w-5 h-5 text-muted-foreground shrink-0" />;
  };

  const passed = response?.summary?.passed ?? 0;
  const failed = response?.summary?.failed ?? 0;
  const total = response?.summary?.total ?? 0;
  const allPassed = total > 0 && failed === 0;

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Badge variant="outline" className="border-primary/30 text-primary">
            Dev Tools
          </Badge>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold">RLS Isolation Tester</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Verifies end-to-end Row-Level Security: a customer books in Salon A,
            Salon A's owner sees it, and Salon B's owner is fully blocked from reading or modifying it.
          </p>
        </motion.div>

        {/* What it tests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Test scenarios
            </CardTitle>
            <CardDescription>
              The function provisions two isolated salons with their own owners and one customer,
              runs the checks, and tears everything down.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Seed two isolated salons (A & B) with owners + a customer in A</li>
              <li>Customer A inserts an appointment in Salon A</li>
              <li>Owner A reads appointments in own salon</li>
              <li>Owner B is BLOCKED from reading Salon A appointments</li>
              <li>Owner B is BLOCKED from updating Salon A appointment</li>
              <li>Owner B is BLOCKED from reading Salon A customers</li>
              <li>Customer A only sees their own appointments</li>
            </ol>
          </CardContent>
        </Card>

        {/* Run button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={runTests}
            disabled={running}
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 px-8"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running checks…
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Run RLS test suite
              </>
            )}
          </Button>
        </div>

        {/* Summary */}
        <AnimatePresence>
          {response?.summary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert
                className={
                  allPassed
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-destructive/40 bg-destructive/5'
                }
              >
                {allPassed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <AlertTitle>
                  {allPassed ? 'All RLS checks passed' : 'Some checks failed'}
                </AlertTitle>
                <AlertDescription>
                  {passed} passed · {failed} failed · {total} total
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {response?.results && response.results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Step-by-step results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {response.results.map((r, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <StatusIcon status={r.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.step}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 break-words">
                      {r.detail}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      r.status === 'pass'
                        ? 'border-emerald-500/40 text-emerald-500'
                        : r.status === 'fail'
                        ? 'border-destructive/40 text-destructive'
                        : 'border-border text-muted-foreground'
                    }
                  >
                    {r.status}
                  </Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}

        {response?.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Tester failed to run</AlertTitle>
            <AlertDescription className="break-words">{response.error}</AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Manual verification helpers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manual verification</CardTitle>
            <CardDescription>
              Pair the automated checks with a manual visual confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/dashboard/appointments">
                Open Appointments dashboard
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link to="/customer/book">
                Open customer booking flow
                <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RlsTesterPage;
