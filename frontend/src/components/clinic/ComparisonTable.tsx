import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users, Award, Languages } from "lucide-react";
import { Link } from '@tanstack/react-router';

interface Clinic {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  images: string[];
  services: string[];
  languages?: string[];
  certifications?: string[];
  accreditations?: string[];
  establishedYear?: number;
  doctorCount?: number;
  averageRating?: number;
  procedures?: Array<{
    name: string;
    averagePrice: number | null;
  }>;
  _count?: {
    reviews: number;
  };
}

interface ComparisonTableProps {
  clinics: Clinic[];
}

export function ComparisonTable({ clinics }: ComparisonTableProps) {
  if (clinics.length === 0) {
    return null;
  }

  // Get all unique services across clinics
  const allServices = Array.from(
    new Set(clinics.flatMap((c) => c.services || []))
  ).sort();

  // Get all unique languages across clinics
  const allLanguages = Array.from(
    new Set(clinics.flatMap((c) => c.languages || []))
  ).sort();

  // Get all unique procedures across clinics
  const allProcedures = Array.from(
    new Set(clinics.flatMap((c) => c.procedures?.map((p) => p.name) || []))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Basic Info Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Feature</th>
                  {clinics.map((clinic) => (
                    <th key={clinic.id} className="text-left p-2 border-b min-w-[200px]">
                      <Link
                        to="/clinics/$slug"
                        params={{ slug: clinic.slug }}
                        className="font-semibold hover:underline"
                      >
                        {clinic.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 font-medium">Location</td>
                  {clinics.map((clinic) => (
                    <td key={clinic.id} className="p-2">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {clinic.address}, {clinic.city}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 font-medium">Rating</td>
                  {clinics.map((clinic) => (
                    <td key={clinic.id} className="p-2">
                      {clinic.averageRating && clinic.averageRating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {clinic.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({clinic._count?.reviews || 0} reviews)
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No ratings yet</span>
                      )}
                    </td>
                  ))}
                </tr>
                {clinics.some((c) => c.establishedYear) && (
                  <tr>
                    <td className="p-2 font-medium">Established</td>
                    {clinics.map((clinic) => (
                      <td key={clinic.id} className="p-2">
                        {clinic.establishedYear || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
                {clinics.some((c) => c.doctorCount) && (
                  <tr>
                    <td className="p-2 font-medium">Doctors</td>
                    {clinics.map((clinic) => (
                      <td key={clinic.id} className="p-2">
                        {clinic.doctorCount ? (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {clinic.doctorCount}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Services Comparison */}
      {allServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">Service</th>
                    {clinics.map((clinic) => (
                      <th key={clinic.id} className="text-left p-2 border-b min-w-[200px]">
                        {clinic.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allServices.map((service) => (
                    <tr key={service}>
                      <td className="p-2 font-medium">{service}</td>
                      {clinics.map((clinic) => (
                        <td key={clinic.id} className="p-2">
                          {clinic.services?.includes(service) ? (
                            <Badge variant="secondary">✓</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Languages Comparison */}
      {allLanguages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Languages Spoken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">Language</th>
                    {clinics.map((clinic) => (
                      <th key={clinic.id} className="text-left p-2 border-b min-w-[200px]">
                        {clinic.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allLanguages.map((language) => (
                    <tr key={language}>
                      <td className="p-2 font-medium">{language}</td>
                      {clinics.map((clinic) => (
                        <td key={clinic.id} className="p-2">
                          {clinic.languages?.includes(language) ? (
                            <Badge variant="outline" className="gap-1">
                              <Languages className="h-3 w-3" />
                              ✓
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Procedure Pricing Comparison */}
      {allProcedures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Procedure Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">Procedure</th>
                    {clinics.map((clinic) => (
                      <th key={clinic.id} className="text-left p-2 border-b min-w-[200px]">
                        {clinic.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allProcedures.map((procedureName) => (
                    <tr key={procedureName}>
                      <td className="p-2 font-medium">{procedureName}</td>
                      {clinics.map((clinic) => {
                        const procedure = clinic.procedures?.find(
                          (p) => p.name === procedureName
                        );
                        return (
                          <td key={clinic.id} className="p-2">
                            {procedure?.averagePrice ? (
                              <span className="font-semibold">
                                ${procedure.averagePrice.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications Comparison */}
      {(clinics.some((c) => c.certifications?.length) ||
        clinics.some((c) => c.accreditations?.length)) && (
        <Card>
          <CardHeader>
            <CardTitle>Certifications & Accreditations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clinics.map((clinic) => (
                <div key={clinic.id}>
                  <h3 className="font-semibold mb-2">{clinic.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {clinic.certifications?.map((cert, idx) => (
                      <Badge key={idx} variant="secondary">
                        <Award className="mr-1 h-3 w-3" />
                        {cert}
                      </Badge>
                    ))}
                    {clinic.accreditations?.map((acc, idx) => (
                      <Badge key={idx} variant="outline">
                        <Award className="mr-1 h-3 w-3" />
                        {acc}
                      </Badge>
                    ))}
                    {(!clinic.certifications?.length &&
                      !clinic.accreditations?.length) && (
                      <span className="text-muted-foreground">None listed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
