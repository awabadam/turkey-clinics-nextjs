import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Building2, User } from 'lucide-react';

const step1Schema = z.object({
  clinicName: z.string().min(2, "Clinic name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  phone: z.string().min(5, "Phone is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal('')),
  description: z.string().optional(),
});

const step2Schema = z.object({
  ownerName: z.string().min(2, "Owner name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const Route = createFileRoute('/clinic-registration')({
  component: ClinicRegistrationPage,
});

function ClinicRegistrationPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const {
    register: registerStep1,
    formState: { errors: errorsStep1 },
    trigger: triggerStep1,
    getValues: getValuesStep1,
  } = useForm({
    resolver: zodResolver(step1Schema),
    mode: 'onBlur',
  });

  const {
    register: registerStep2,
    handleSubmit: handleSubmitStep2,
    formState: { errors: errorsStep2 },
    getValues: getValuesStep2,
  } = useForm({
    resolver: zodResolver(step2Schema),
    mode: 'onBlur',
  });

  const onSubmit = async () => {
    setLoading(true);
    try {
      const data1 = getValuesStep1();
      const data2 = getValuesStep2();

      await api.post('/clinics/register', {
        ...data1,
        ...data2,
      });

      setCompleted(true);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    const isValid = await triggerStep1();
    if (isValid) setStep(2);
  };

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 p-3 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Registration Submitted!</CardTitle>
            <CardDescription>
              Thank you for registering your clinic. Our team will review your application and contact you shortly.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link to="/" search={{ city: undefined, search: undefined, services: undefined, languages: undefined, minRating: undefined, sortBy: 'newest', page: undefined }}>Back to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 py-12">
      <div className="w-full max-w-2xl mb-8 text-center">
        <h1 className="text-3xl font-serif font-bold mb-2">Partner with Turkey Clinic Guide</h1>
        <p className="text-muted-foreground">Join our network of premium clinics and reach international patients.</p>
      </div>

      <div className="w-full max-w-2xl">
        {/* Steps Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 1 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'}`}>
              <Building2 className="h-5 w-5" />
            </div>
            <div className={`w-16 h-1 bg-muted ${step >= 2 ? 'bg-primary' : ''}`} />
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'}`}>
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{step === 1 ? 'Clinic Details' : 'Owner Information'}</CardTitle>
            <CardDescription>
              {step === 1 ? 'Tell us about your facility.' : 'Create your admin account.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Clinic Name</Label>
                  <Input {...registerStep1('clinicName')} placeholder="e.g. Istanbul Dental Center" />
                  {errorsStep1.clinicName && <p className="text-sm text-destructive">{errorsStep1.clinicName.message as string}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input {...registerStep1('city')} placeholder="Istanbul" />
                    {errorsStep1.city && <p className="text-sm text-destructive">{errorsStep1.city.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input {...registerStep1('phone')} placeholder="+90 ..." />
                    {errorsStep1.phone && <p className="text-sm text-destructive">{errorsStep1.phone.message as string}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input {...registerStep1('address')} placeholder="Full address" />
                  {errorsStep1.address && <p className="text-sm text-destructive">{errorsStep1.address.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Website (Optional)</Label>
                  <Input {...registerStep1('website')} placeholder="https://..." />
                  {errorsStep1.website && <p className="text-sm text-destructive">{errorsStep1.website.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea {...registerStep1('description')} placeholder="Brief description of your clinic..." />
                </div>
              </form>
            )}

            {step === 2 && (
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input {...registerStep2('ownerName')} placeholder="Your name" />
                  {errorsStep2.ownerName && <p className="text-sm text-destructive">{errorsStep2.ownerName.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input {...registerStep2('email')} type="email" placeholder="owner@clinic.com" />
                  {errorsStep2.email && <p className="text-sm text-destructive">{errorsStep2.email.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input {...registerStep2('password')} type="password" />
                  {errorsStep2.password && <p className="text-sm text-destructive">{errorsStep2.password.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input {...registerStep2('confirmPassword')} type="password" />
                  {errorsStep2.confirmPassword && <p className="text-sm text-destructive">{errorsStep2.confirmPassword.message as string}</p>}
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step === 2 ? (
              <>
                <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
                  Back
                </Button>
                <Button onClick={handleSubmitStep2(onSubmit)} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </>
            ) : (
              <div className="ml-auto">
                <Button onClick={nextStep}>Next</Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
