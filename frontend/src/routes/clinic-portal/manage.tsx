import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from '@/components/admin/ImageUpload'

export const Route = createFileRoute('/clinic-portal/manage')({
  component: ManageClinicPage,
})

const clinicSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  phone: z.string().min(5, "Phone is required"),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  services: z.string().optional(), // Comma separated
  languages: z.string().optional(),
  certifications: z.string().optional(),
  accreditations: z.string().optional(),
  doctorCount: z.string().optional(), // Input as string, convert to number
  establishedYear: z.string().optional(),
  images: z.array(z.string()).default([]),
  beforeAfterImages: z.array(z.string()).default([]),
  successStories: z.string().optional(), // Newline separated
})

type ClinicFormValues = z.infer<typeof clinicSchema>

function ManageClinicPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [clinicId, setClinicId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      address: '',
      city: '',
      phone: '',
      website: '',
      email: '',
      services: '',
      languages: '',
      certifications: '',
      accreditations: '',
      doctorCount: '',
      establishedYear: '',
      images: [],
      beforeAfterImages: [],
      successStories: '',
    }
  })

  // Watch for image uploads
  const images = watch('images')
  const beforeAfterImages = watch('beforeAfterImages')

  useEffect(() => {
    async function fetchClinic() {
      try {
        const clinic = await api.get<any>('/clinics/my-clinic')
        setClinicId(clinic.id)
        
        // Populate form
        setValue('name', clinic.name)
        setValue('description', clinic.description || '')
        setValue('address', clinic.address)
        setValue('city', clinic.city)
        setValue('phone', clinic.phone)
        setValue('website', clinic.website || '')
        setValue('email', clinic.email || '')
        
        setValue('services', (clinic.services || []).join(', '))
        setValue('languages', (clinic.languages || []).join(', '))
        setValue('certifications', (clinic.certifications || []).join(', '))
        setValue('accreditations', (clinic.accreditations || []).join(', '))
        
        setValue('doctorCount', clinic.doctorCount?.toString() || '')
        setValue('establishedYear', clinic.establishedYear?.toString() || '')
        
        setValue('images', clinic.images || [])
        setValue('beforeAfterImages', clinic.beforeAfterImages || [])
        setValue('successStories', (clinic.successStories || []).join('\n'))
        
      } catch (error) {
        console.error('Error fetching clinic:', error)
        toast({
          title: "Error",
          description: "Failed to load clinic information",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchClinic()
  }, [setValue, toast])

  const onSubmit = async (data: ClinicFormValues) => {
    if (!clinicId) return

    try {
      // Transform data
      const payload = {
        ...data,
        services: data.services?.split(',').map(s => s.trim()).filter(Boolean) || [],
        languages: data.languages?.split(',').map(s => s.trim()).filter(Boolean) || [],
        certifications: data.certifications?.split(',').map(s => s.trim()).filter(Boolean) || [],
        accreditations: data.accreditations?.split(',').map(s => s.trim()).filter(Boolean) || [],
        successStories: data.successStories?.split('\n').map(s => s.trim()).filter(Boolean) || [],
        doctorCount: data.doctorCount ? parseInt(data.doctorCount) : undefined,
        establishedYear: data.establishedYear ? parseInt(data.establishedYear) : undefined,
      }

      await api.put(`/clinics/${clinicId}`, payload)

      toast({
        title: "Success",
        description: "Clinic information updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating clinic:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update clinic",
        variant: "destructive",
      })
    }
  }

  if (loading) return <div>Loading clinic details...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Clinic Profile</CardTitle>
        <CardDescription>Update your clinic's public information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Clinic Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={5} {...register('description')} />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register('address')} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register('city')} />
                  {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register('phone')} />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Public)</Label>
                  <Input id="email" {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...register('website')} />
                {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="services">Services (Comma separated)</Label>
                <Textarea id="services" {...register('services')} placeholder="Dental Implants, Veneers, ..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Languages (Comma separated)</Label>
                <Input id="languages" {...register('languages')} placeholder="English, Turkish, ..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctorCount">Number of Doctors</Label>
                  <Input id="doctorCount" type="number" {...register('doctorCount')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input id="establishedYear" type="number" {...register('establishedYear')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (Comma separated)</Label>
                <Input id="certifications" {...register('certifications')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accreditations">Accreditations (Comma separated)</Label>
                <Input id="accreditations" {...register('accreditations')} />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Clinic Images</Label>
                <ImageUpload
                  label="Clinic Images"
                  value={images || []}
                  onChange={(urls) => setValue('images', urls)}
                  maxImages={10}
                />
              </div>
              <div className="space-y-2">
                <Label>Before & After Images</Label>
                <ImageUpload
                  label="Before & After Images"
                  value={beforeAfterImages || []}
                  onChange={(urls) => setValue('beforeAfterImages', urls)}
                  maxImages={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="successStories">Success Stories (One per line)</Label>
                <Textarea id="successStories" rows={4} {...register('successStories')} />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate({ to: '/clinic-portal' })}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
