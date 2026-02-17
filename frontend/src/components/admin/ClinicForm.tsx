import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "./ImageUpload"
import { api } from "@/lib/api"
import { slugify } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Clinic {
  id?: string
  name?: string
  slug?: string
  description?: string | null
  address?: string
  city?: string
  phone?: string
  email?: string | null
  website?: string | null
  latitude?: number | null
  longitude?: number | null
  services?: string[]
  languages?: string[]
  certifications?: string[]
  accreditations?: string[]
  doctorCount?: number | null
  establishedYear?: number | null
  beforeAfterImages?: string[]
  trustBadges?: string[]
  testimonials?: any
  successStories?: string[]
  images?: string[]
  featured?: boolean
}

interface ClinicFormProps {
  clinic?: Clinic
}

export default function ClinicForm({ clinic }: ClinicFormProps) {
  console.log('ClinicForm rendering with clinic:', clinic)
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm({
    defaultValues: {
      name: clinic?.name || "",
      slug: clinic?.slug || "",
      description: clinic?.description || "",
      address: clinic?.address || "",
      city: clinic?.city || "",
      phone: clinic?.phone || "",
      email: clinic?.email || "",
      website: clinic?.website || "",
      latitude: clinic?.latitude?.toString() || "",
      longitude: clinic?.longitude?.toString() || "",
      services: (clinic?.services || []).join(", "),
      languages: (clinic?.languages || []).join(", "),
      certifications: (clinic?.certifications || []).join(", "),
      accreditations: (clinic?.accreditations || []).join(", "),
      doctorCount: clinic?.doctorCount?.toString() || "",
      establishedYear: clinic?.establishedYear?.toString() || "",
      beforeAfterImages: clinic?.beforeAfterImages || [],
      trustBadges: (clinic?.trustBadges || []).join(", "),
      testimonials: JSON.stringify(clinic?.testimonials || []),
      successStories: (clinic?.successStories || []).join("\n"),
      images: clinic?.images || [],
      featured: clinic?.featured || false,
    },
    onSubmit: async ({ value }) => {
      try {
        const services = value.services
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        const languages = value.languages
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        const certifications = value.certifications
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        const accreditations = value.accreditations
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        const images = value.images
        const beforeAfterImages = value.beforeAfterImages
        const trustBadges = value.trustBadges
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        const successStories = value.successStories
          .split("\n")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
        let testimonials = []
        try {
          testimonials = JSON.parse(value.testimonials || "[]")
        } catch (e) {
          testimonials = []
        }

        const clinicSlug = value.slug || slugify(value.name)

        const payload = {
          name: value.name,
          slug: clinicSlug,
          description: value.description || undefined,
          address: value.address,
          city: value.city,
          phone: value.phone,
          email: value.email || undefined,
          website: value.website || undefined,
          latitude: value.latitude ? parseFloat(value.latitude) : undefined,
          longitude: value.longitude ? parseFloat(value.longitude) : undefined,
          services,
          languages,
          certifications,
          accreditations,
          doctorCount: value.doctorCount ? parseInt(value.doctorCount) : undefined,
          establishedYear: value.establishedYear ? parseInt(value.establishedYear) : undefined,
          beforeAfterImages,
          trustBadges,
          testimonials,
          successStories,
          images,
          featured: value.featured,
        }

        if (clinic?.id) {
          console.log('Updating clinic:', clinic.id, payload)
          await api.put(`/clinics/${clinic.id}`, payload)
        } else {
          console.log('Creating clinic:', payload)
          await api.post("/clinics", payload)
        }

        toast({
          title: clinic ? "Clinic updated successfully!" : "Clinic created successfully!",
          description: `The clinic has been ${clinic ? "updated" : "created"}.`,
        })
        navigate({ to: "/admin/clinics" })
      } catch (err: any) {
        console.error('Error saving clinic:', err)
        let errorMessage = "Failed to save clinic"
        
        // Handle Zod validation errors from backend
        if (err.error && Array.isArray(err.error)) {
          errorMessage = err.error.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
        } else if (err.message) {
          errorMessage = err.message
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        throw err
      }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{clinic ? "Edit Clinic" : "Create New Clinic"}</CardTitle>
        <CardDescription>
          {clinic ? "Update clinic information" : "Add a new clinic to the directory"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit().catch((error) => {
              console.error('Form submission error:', error)
            })
          }}
          className="space-y-6"
        >
          {form.state.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {form.state.errors.map((error: any) => error?.message || String(error)).join(", ")}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contact">Contact & Location</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media & Content</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) => (!value || value.length < 1 ? "Name is required" : undefined),
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Name *</Label>
                    <Input
                      id={field.name}
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="slug">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Slug</Label>
                    <Input
                      id={field.name}
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Will be generated from name if empty"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Description</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="featured">
                {(field) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={field.name}
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked as boolean)}
                    />
                    <Label htmlFor={field.name} className="cursor-pointer">
                      Featured
                    </Label>
                  </div>
                )}
              </form.Field>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field
                  name="address"
                  validators={{
                    onChange: ({ value }) => (!value || value.length < 1 ? "Address is required" : undefined),
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Address *</Label>
                      <Input
                        id={field.name}
                        type="text"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="city"
                  validators={{
                    onChange: ({ value }) => (!value || value.length < 1 ? "City is required" : undefined),
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>City *</Label>
                      <Input
                        id={field.name}
                        type="text"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <form.Field
                  name="phone"
                  validators={{
                    onChange: ({ value }) => (!value || value.length < 1 ? "Phone is required" : undefined),
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Phone *</Label>
                      <Input
                        id={field.name}
                        type="tel"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="email">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        type="email"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="website">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Website</Label>
                      <Input
                        id={field.name}
                        type="url"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field name="latitude">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Latitude</Label>
                      <Input
                        id={field.name}
                        type="number"
                        step="any"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="longitude">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Longitude</Label>
                      <Input
                        id={field.name}
                        type="number"
                        step="any"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 pt-4">
              <form.Field name="services">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Services (comma-separated)</Label>
                    <Input
                      id={field.name}
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Implant, Teeth Whitening, Orthodontics"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="languages">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Languages Spoken (comma-separated)</Label>
                    <Input
                      id={field.name}
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="English, Turkish, Arabic, Russian"
                    />
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field name="doctorCount">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Number of Doctors</Label>
                      <Input
                        id={field.name}
                        type="number"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="5"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="establishedYear">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Established Year</Label>
                      <Input
                        id={field.name}
                        type="number"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="2010"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field name="certifications">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Certifications (comma-separated)</Label>
                      <Input
                        id={field.name}
                        type="text"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="ISO 9001, JCI Accredited"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="accreditations">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Accreditations (comma-separated)</Label>
                      <Input
                        id={field.name}
                        type="text"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Ministry of Health, Dental Association"
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 pt-4">
              <form.Field name="images">
                {(field) => (
                  <ImageUpload
                    label="Clinic Images"
                    value={field.state.value}
                    onChange={(urls) => field.handleChange(urls)}
                    multiple={true}
                    maxImages={20}
                  />
                )}
              </form.Field>

              <form.Field name="beforeAfterImages">
                {(field) => (
                  <ImageUpload
                    label="Before & After Images"
                    value={field.state.value}
                    onChange={(urls) => field.handleChange(urls)}
                    multiple={true}
                    maxImages={20}
                  />
                )}
              </form.Field>

              <form.Field name="trustBadges">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Trust Badges (comma-separated)</Label>
                    <Input
                      id={field.name}
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="JCI Accredited, ISO Certified"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="testimonials">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Testimonials (JSON array)</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={4}
                      placeholder='[{"name": "John Doe", "text": "Great experience!", "rating": 5}]'
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="successStories">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Success Stories (one per line)</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      rows={4}
                      placeholder="Patient success story 1...&#10;Patient success story 2..."
                    />
                  </div>
                )}
              </form.Field>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/admin/clinics" })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? "Saving..." : clinic ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
