import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertInbodyPatientSchema, insertInbodyTestSchema,
  STAFF_OPTIONS, SUBSCRIPTION_PLANS,
  type InbodyPatient, type InbodyTest,
  type InsertInbodyPatient, type InsertInbodyTest,
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Plus, Search, ArrowLeft, Activity, Users, Calendar, CreditCard,
  Trash2, Printer, UserPlus, FlaskConical,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TestWithPatient {
  test: InbodyTest;
  patient: InbodyPatient;
}

// ─── Utility ────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function thisMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  title, value, icon: Icon, color,
}: { title: string; value: number | string; icon: any; color: string }) {
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900" data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Add Patient Dialog ──────────────────────────────────────────────────────

function AddPatientDialog({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();

  const form = useForm<InsertInbodyPatient>({
    resolver: zodResolver(insertInbodyPatientSchema),
    defaultValues: {
      patientId: "",
      name: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      totalSessions: 0,
      remainingSessions: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertInbodyPatient) => apiRequest("POST", "/api/inbody/patients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inbody/patients"] });
      toast({ title: "Patient créé avec succès" });
      onOpenChange(false);
      form.reset();
    },
    onError: (err: any) => toast({ title: err?.message ?? "Erreur lors de la création", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau patient</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="patientId" render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Patient</FormLabel>
                  <FormControl><Input placeholder="Ex: P001" data-testid="input-patient-id" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl><Input placeholder="Nom du patient" data-testid="input-patient-name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone (optionnel)</FormLabel>
                <FormControl><Input placeholder="0612345678" data-testid="input-patient-phone" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optionnel)</FormLabel>
                <FormControl><Input type="email" placeholder="email@example.com" data-testid="input-patient-email" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
              <FormItem>
                <FormLabel>Date de naissance (optionnel)</FormLabel>
                <FormControl><Input type="date" data-testid="input-patient-dob" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" data-testid="button-submit-patient" disabled={mutation.isPending}>Créer le patient</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Session Dialog ──────────────────────────────────────────────────────

function AddSubscriptionDialog({
  patient, open, onOpenChange,
}: { patient: InbodyPatient; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const [plan, setPlan] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (sessions: number) =>
      apiRequest("PATCH", `/api/inbody/patients/${patient.id}`, {
        totalSessions: patient.totalSessions + sessions,
        remainingSessions: patient.remainingSessions + sessions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inbody/patients"] });
      toast({ title: `${plan} session(s) ajoutée(s) pour ${patient.name}` });
      onOpenChange(false);
      setPlan(null);
    },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Abonnement — {patient.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Sessions restantes actuelles : <strong>{patient.remainingSessions}</strong></p>
          <p className="text-sm font-medium text-slate-700">Choisir un forfait :</p>
          <div className="grid grid-cols-3 gap-2">
            {SUBSCRIPTION_PLANS.map((p) => (
              <button
                key={p}
                data-testid={`plan-${p}`}
                onClick={() => setPlan(p)}
                className={`border rounded-xl p-3 text-center transition-all ${plan === p ? "border-primary bg-primary/10 text-primary font-bold" : "border-slate-200 hover:border-primary/50 text-slate-700"}`}
              >
                <span className="block text-lg font-bold">{p}</span>
                <span className="text-xs text-slate-500">séance{p > 1 ? "s" : ""}</span>
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            onClick={() => plan && mutation.mutate(plan)}
            disabled={!plan || mutation.isPending}
            data-testid="button-confirm-subscription"
          >
            Confirmer l'abonnement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Test Dialog ─────────────────────────────────────────────────────────

function AddTestDialog({
  patient, open, onOpenChange,
}: { patient: InbodyPatient; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();

  const form = useForm<InsertInbodyTest>({
    resolver: zodResolver(insertInbodyTestSchema),
    defaultValues: {
      patientId: patient.id,
      testDate: todayStr(),
      operator: "",
      weight: undefined,
      bodyFat: undefined,
      muscleMass: undefined,
      bmi: undefined,
      bodyWater: undefined,
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertInbodyTest) => apiRequest("POST", "/api/inbody/tests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inbody/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inbody/patients", patient.id, "tests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inbody/tests"] });
      toast({ title: "Séance InBody enregistrée" });
      onOpenChange(false);
      form.reset();
    },
    onError: () => toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une séance InBody — {patient.name}</DialogTitle>
        </DialogHeader>
        {patient.remainingSessions === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            ⚠️ Ce patient n'a plus de sessions disponibles. Veuillez ajouter un abonnement.
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate({ ...d, patientId: patient.id }))} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="testDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date du test</FormLabel>
                  <FormControl><Input type="date" data-testid="input-test-date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="operator" render={({ field }) => (
                <FormItem>
                  <FormLabel>Opérateur</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-test-operator">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STAFF_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["weight", "bodyFat", "muscleMass", "bmi", "bodyWater"] as const).map((field) => {
                const labels: Record<string, string> = {
                  weight: "Poids (kg)", bodyFat: "Masse grasse (%)",
                  muscleMass: "Masse musculaire (kg)", bmi: "IMC", bodyWater: "Eau corporelle (L)",
                };
                return (
                  <FormField key={field} control={form.control} name={field} render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>{labels[field]}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          data-testid={`input-test-${field}`}
                          {...f}
                          value={f.value ?? ""}
                          onChange={(e) => f.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                );
              })}
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea placeholder="Notes..." rows={2} data-testid="input-test-notes" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" data-testid="button-submit-test" disabled={mutation.isPending}>Enregistrer la séance</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Patient Profile ──────────────────────────────────────────────────────────

function PatientProfile({ patient, onBack }: { patient: InbodyPatient; onBack: () => void }) {
  const { toast } = useToast();
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: rawPatient } = useQuery<InbodyPatient>({
    queryKey: ["/api/inbody/patients", patient.id],
  });
  const currentPatient = rawPatient ?? patient;

  const { data: tests = [] } = useQuery<InbodyTest[]>({
    queryKey: ["/api/inbody/patients", patient.id, "tests"],
    queryFn: () => fetch(`/api/inbody/patients/${patient.id}/tests`).then((r) => r.json()),
  });

  const deleteTestMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inbody/tests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inbody/patients", patient.id, "tests"] });
      toast({ title: "Séance supprimée" });
      setDeleteTestId(null);
    },
  });

  const chartData = [...tests].reverse().map((t) => ({
    date: t.testDate,
    "Poids": t.weight,
    "Masse grasse": t.bodyFat,
    "Masse musculaire": t.muscleMass,
  }));

  function handlePrint() {
    window.print();
  }

  const sessionPct = currentPatient.totalSessions > 0
    ? Math.round((currentPatient.remainingSessions / currentPatient.totalSessions) * 100)
    : 0;

  return (
    <div className="space-y-6 print:p-8" ref={printRef}>
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSubDialogOpen(true)} data-testid="button-add-subscription" className="gap-2">
            <CreditCard className="w-4 h-4" /> Abonnement
          </Button>
          <Button onClick={() => setTestDialogOpen(true)} data-testid="button-add-test" className="gap-2">
            <Plus className="w-4 h-4" /> Ajouter une séance InBody
          </Button>
          <Button variant="outline" onClick={handlePrint} data-testid="button-print-report" className="gap-2">
            <Printer className="w-4 h-4" /> Imprimer le rapport
          </Button>
        </div>
      </div>

      {/* Patient Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informations du patient</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-slate-500">ID</p><p className="font-semibold text-slate-900" data-testid="text-patient-id">{currentPatient.patientId}</p></div>
            <div><p className="text-slate-500">Nom</p><p className="font-semibold text-slate-900" data-testid="text-patient-name">{currentPatient.name}</p></div>
            <div><p className="text-slate-500">Téléphone</p><p className="font-medium text-slate-700">{currentPatient.phoneNumber ?? "—"}</p></div>
            <div><p className="text-slate-500">Email</p><p className="font-medium text-slate-700">{currentPatient.email ?? "—"}</p></div>
            <div><p className="text-slate-500">Date de naissance</p><p className="font-medium text-slate-700">{currentPatient.dateOfBirth ?? "—"}</p></div>
            <div><p className="text-slate-500">Dernier test</p><p className="font-medium text-slate-700">{tests[0]?.testDate ?? "—"}</p></div>
          </CardContent>
        </Card>
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Abonnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sessions restantes</span>
              <span className="font-bold text-slate-900" data-testid="text-remaining-sessions">{currentPatient.remainingSessions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total sessions</span>
              <span className="font-medium">{currentPatient.totalSessions}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all"
                style={{ width: `${sessionPct}%` }}
              />
            </div>
            {currentPatient.remainingSessions === 0 && (
              <p className="text-xs text-red-500 font-medium">⚠️ Aucune session disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest measurements */}
      {tests.length > 0 && (
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Dernières mesures — {tests[0].testDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Poids", value: tests[0].weight, unit: "kg" },
                { label: "Masse grasse", value: tests[0].bodyFat, unit: "%" },
                { label: "Masse musculaire", value: tests[0].muscleMass, unit: "kg" },
                { label: "IMC", value: tests[0].bmi, unit: "" },
                { label: "Eau corporelle", value: tests[0].bodyWater, unit: "L" },
              ].map(({ label, value, unit }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-xl font-bold text-slate-900">{value ?? "—"}<span className="text-sm font-normal text-slate-500"> {unit}</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {chartData.length > 1 && (
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Évolution dans le temps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { key: "Poids", color: "#4f46e5" },
              { key: "Masse grasse", color: "#ef4444" },
              { key: "Masse musculaire", color: "#22c55e" },
            ].map(({ key, color }) => (
              <div key={key}>
                <p className="text-sm font-medium text-slate-600 mb-2">{key}</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Test History */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Historique des séances</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Aucune séance enregistrée</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead className="font-semibold text-slate-700">Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Poids</TableHead>
                  <TableHead className="font-semibold text-slate-700">Masse grasse</TableHead>
                  <TableHead className="font-semibold text-slate-700">Masse musc.</TableHead>
                  <TableHead className="font-semibold text-slate-700">IMC</TableHead>
                  <TableHead className="font-semibold text-slate-700">Eau</TableHead>
                  <TableHead className="font-semibold text-slate-700">Opérateur</TableHead>
                  <TableHead className="font-semibold text-slate-700">Notes</TableHead>
                  <TableHead className="font-semibold text-slate-700 print:hidden">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((t) => (
                  <TableRow key={t.id} data-testid={`row-test-${t.id}`}>
                    <TableCell className="text-sm font-medium">{t.testDate}</TableCell>
                    <TableCell className="text-sm">{t.weight ?? "—"} kg</TableCell>
                    <TableCell className="text-sm">{t.bodyFat ?? "—"} %</TableCell>
                    <TableCell className="text-sm">{t.muscleMass ?? "—"} kg</TableCell>
                    <TableCell className="text-sm">{t.bmi ?? "—"}</TableCell>
                    <TableCell className="text-sm">{t.bodyWater ?? "—"} L</TableCell>
                    <TableCell className="text-sm">{t.operator}</TableCell>
                    <TableCell className="text-sm text-slate-500 max-w-[120px] truncate">{t.notes ?? "—"}</TableCell>
                    <TableCell className="print:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTestId(t.id)}
                        data-testid={`button-delete-test-${t.id}`}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddTestDialog patient={currentPatient} open={testDialogOpen} onOpenChange={setTestDialogOpen} />
      <AddSubscriptionDialog patient={currentPatient} open={subDialogOpen} onOpenChange={setSubDialogOpen} />

      <AlertDialog open={deleteTestId !== null} onOpenChange={(v) => { if (!v) setDeleteTestId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette séance ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTestId !== null && deleteTestMutation.mutate(deleteTestId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Main InBody Page ─────────────────────────────────────────────────────────

export default function InBody() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<InbodyPatient | null>(null);
  const [deletePatientId, setDeletePatientId] = useState<number | null>(null);
  const [subTarget, setSubTarget] = useState<InbodyPatient | null>(null);

  const { data: patients = [], isLoading } = useQuery<InbodyPatient[]>({
    queryKey: ["/api/inbody/patients"],
  });

  const { data: allTests = [] } = useQuery<InbodyTest[]>({
    queryKey: ["/api/inbody/tests"],
  });

  const deletePatientMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inbody/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inbody/patients"] });
      toast({ title: "Patient supprimé" });
      setDeletePatientId(null);
    },
  });

  const today = todayStr();
  const month = thisMonth();

  const testsToday = allTests.filter((t) => t.testDate === today).length;
  const testsThisMonth = allTests.filter((t) => t.testDate.startsWith(month)).length;
  const activeSubs = patients.filter((p) => p.remainingSessions > 0).length;

  const filteredPatients = patients.filter(
    (p) =>
      p.patientId.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const getLastTest = (patientId: number) => {
    const test = allTests.find((t) => t.patientId === patientId);
    return test?.testDate ?? "—";
  };

  if (selectedPatient) {
    return <PatientProfile patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">InBody</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestion des tests de composition corporelle</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={patients.length} icon={Users} color="bg-blue-500" />
        <StatCard title="Tests Aujourd'hui" value={testsToday} icon={Activity} color="bg-emerald-500" />
        <StatCard title="Tests ce Mois" value={testsThisMonth} icon={Calendar} color="bg-violet-500" />
        <StatCard title="Abonnements Actifs" value={activeSubs} icon={CreditCard} color="bg-amber-500" />
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Rechercher par ID patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-patient"
          />
        </div>
        <Button onClick={() => setAddPatientOpen(true)} data-testid="button-add-patient" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Ajouter un nouveau patient
        </Button>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Chargement...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              {search ? "Aucun patient trouvé" : "Aucun patient enregistré"}
            </p>
            {!search && (
              <p className="text-slate-400 text-sm mt-1">Cliquez sur "Ajouter un nouveau patient" pour commencer.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="font-semibold text-slate-700">ID Patient</TableHead>
                <TableHead className="font-semibold text-slate-700">Nom</TableHead>
                <TableHead className="font-semibold text-slate-700">Abonnement</TableHead>
                <TableHead className="font-semibold text-slate-700">Sessions restantes</TableHead>
                <TableHead className="font-semibold text-slate-700">Dernier test</TableHead>
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((p) => (
                <TableRow key={p.id} data-testid={`row-patient-${p.id}`} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-sm font-medium text-slate-700">{p.patientId}</TableCell>
                  <TableCell className="font-medium text-slate-900">{p.name}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.totalSessions > 0 ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                      {p.totalSessions > 0 ? `${p.totalSessions} séance${p.totalSessions > 1 ? "s" : ""}` : "Aucun"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${p.remainingSessions === 0 ? "text-red-500" : "text-emerald-600"}`}>
                      {p.remainingSessions}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{getLastTest(p.id)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPatient(p)}
                        data-testid={`button-view-patient-${p.id}`}
                        className="h-8 text-xs gap-1"
                      >
                        Voir le profil
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSubTarget(p)}
                        data-testid={`button-add-session-${p.id}`}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-primary"
                        title="Ajouter abonnement"
                      >
                        <CreditCard className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletePatientId(p.id)}
                        data-testid={`button-delete-patient-${p.id}`}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialogs */}
      <AddPatientDialog open={addPatientOpen} onOpenChange={setAddPatientOpen} />

      {subTarget && (
        <AddSubscriptionDialog
          patient={subTarget}
          open={true}
          onOpenChange={(v) => { if (!v) setSubTarget(null); }}
        />
      )}

      <AlertDialog open={deletePatientId !== null} onOpenChange={(v) => { if (!v) setDeletePatientId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce patient ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cela supprimera également toutes les séances associées. Action irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePatientId !== null && deletePatientMutation.mutate(deletePatientId)}
              className="bg-red-500 hover:bg-red-600"
              data-testid="button-confirm-delete-patient"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
