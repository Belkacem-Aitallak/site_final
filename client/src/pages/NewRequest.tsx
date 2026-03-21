import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertOrderSchema } from "@shared/schema";
import { useCreateOrder } from "@/hooks/use-orders";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, User, Phone, Package2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Override schema for form validation to ensure friendly messages
const formSchema = insertOrderSchema.extend({
  patientName: z.string().min(2, "Le nom du patient est requis"),
  phoneNumber: z.string().min(8, "Numéro de téléphone invalide"),
  productName: z.string().min(2, "Le nom du produit est requis"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewRequest() {
  const createOrder = useCreateOrder();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      phoneNumber: "",
      productName: "",
      status: "À commander"
    },
  });

  const onSubmit = (data: FormValues) => {
    createOrder.mutate(data, {
      onSuccess: () => {
        form.reset();
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-display font-bold text-slate-900">Nouvelle Demande</h1>
        <p className="text-slate-500 text-lg">Créez une nouvelle commande de produit pour un patient.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <Card className="md:col-span-3 shadow-xl shadow-slate-200/50 border-slate-100 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/60" />
          <CardHeader>
            <CardTitle>Détails de la commande</CardTitle>
            <CardDescription>Remplissez les informations ci-dessous.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Nom du Patient</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="ex: Jean Dupont" 
                            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Numéro de Téléphone</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="ex: 06 12 34 56 78" 
                            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-medium">Nom du Produit</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Package2 className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="ex: Doliprane 1000mg" 
                            className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      Enregistrer la commande
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="font-display font-semibold text-lg text-primary mb-2">Processus</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <p className="text-sm text-slate-600">Enregistrez la demande du patient avec ses coordonnées complètes.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <p className="text-sm text-slate-500">La commande apparaît dans le tableau de bord avec le statut "À commander".</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <p className="text-sm text-slate-500">Suivez l'état de la commande jusqu'à la réception.</p>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
            <h3 className="font-display font-bold text-lg mb-2">Conseil Pro</h3>
            <p className="text-emerald-50 text-sm leading-relaxed">
              Assurez-vous de vérifier le numéro de téléphone. Il sera utilisé pour envoyer automatiquement une notification WhatsApp lors de la réception du produit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
