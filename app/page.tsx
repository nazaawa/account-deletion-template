"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Toaster, toast } from 'sonner'
import { useState } from 'react'

const formSchema = z.object({
  contactMethod: z.enum(["email", "phone"]),
  contactValue: z.string().refine((val) => {
    if (!val) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    
    return emailRegex.test(val) || phoneRegex.test(val)
  }, {
    message: "Please enter a valid email or phone number",
  }),
  reason: z.enum([
    "no_longer_needed",
    "privacy_concerns",
    "switching_service",
    "not_satisfied",
    "other"
  ]),
  customReason: z.string().optional(),
})

export default function AccountDeletionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactMethod: "email",
      contactValue: "",
      reason: "no_longer_needed",
      customReason: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/account-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur s\'est produite')
      }

      toast.success('Demande de suppression envoyée avec succès')
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur s\'est produite')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Toaster richColors position="top-center" />

      <h1 className="text-3xl font-bold mb-8">Demande de Suppression de Compte</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="contactMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment pouvons-nous vous contacter ?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une méthode de contact" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="phone">Téléphone</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contactValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {form.watch("contactMethod") === "email" ? "Adresse e-mail" : "Numéro de téléphone"}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={form.watch("contactMethod") === "email" 
                      ? "Entrez votre e-mail" 
                      : "Entrez votre numéro de téléphone"}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raison de la suppression</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une raison" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no_longer_needed">Plus besoin du service</SelectItem>
                    <SelectItem value="privacy_concerns">Préoccupations de confidentialité</SelectItem>
                    <SelectItem value="switching_service">Changement de service</SelectItem>
                    <SelectItem value="not_satisfied">Non satisfait du service</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("reason") === "other" && (
            <FormField
              control={form.control}
              name="customReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veuillez préciser votre raison</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dites-nous pourquoi vous souhaitez supprimer votre compte"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la Demande de Suppression'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
