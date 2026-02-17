import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/lib/api";

const COMMON_SERVICES = [
  "Dental Implants",
  "Teeth Whitening",
  "Orthodontics",
  "Root Canal",
  "Crowns & Bridges",
  "Veneers",
  "Dental Cleaning",
  "Oral Surgery",
  "Cosmetic Dentistry",
  "Periodontics",
];

const COMMON_LANGUAGES = [
  "English",
  "Turkish",
  "Arabic",
  "Russian",
  "German",
  "French",
  "Spanish",
];

interface SearchParams {
  city?: string;
  search?: string;
  services?: string;
  languages?: string;
  minRating?: string;
  sortBy?: string;
}

export default function AdvancedFilters() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/' });
  const searchParams = search as SearchParams;
  
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState(
    searchParams.city || "all"
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.search || ""
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    searchParams.services?.split(",").filter(Boolean) || []
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    searchParams.languages?.split(",").filter(Boolean) || []
  );
  const [minRating, setMinRating] = useState(
    searchParams.minRating || "all"
  );
  const [sortBy, setSortBy] = useState(
    searchParams.sortBy || "newest"
  );
  const [suggestions, setSuggestions] = useState<Array<{ id: string; name: string; slug: string; city: string; images: string[] }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    async function fetchCities() {
      try {
        const data = await api.get<{ clinics: Array<{ city: string }> }>('/clinics?limit=1000');
        const uniqueCities = Array.from(
          new Set(data.clinics.map((c) => c.city))
        ).sort();
        setCities(uniqueCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    }
    fetchCities();
  }, []);

  // Fetch suggestions when search query changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const data = await api.get<Array<{ id: string; name: string; slug: string; city: string; images: string[] }>>(`/clinics/search?q=${encodeURIComponent(searchQuery)}`);
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync state from URL params
  useEffect(() => {
    setSelectedCity(searchParams.city || "all");
    setSearchQuery(searchParams.search || "");
    setSelectedServices(searchParams.services?.split(",").filter(Boolean) || []);
    setSelectedLanguages(searchParams.languages?.split(",").filter(Boolean) || []);
    setMinRating(searchParams.minRating || "all");
    setSortBy(searchParams.sortBy || "newest");
  }, [searchParams]);

  const handleServiceToggle = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language]
    );
  };

  // Update URL params when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      const params: SearchParams = {};
      if (selectedCity && selectedCity !== "all") params.city = selectedCity;
      if (searchQuery) params.search = searchQuery;
      if (selectedServices.length > 0) params.services = selectedServices.join(",");
      if (selectedLanguages.length > 0) params.languages = selectedLanguages.join(",");
      if (minRating && minRating !== "all") params.minRating = minRating;
      if (sortBy && sortBy !== "newest") params.sortBy = sortBy;
      
      navigate({ 
        to: '/',
        search: {
          city: params.city,
          search: params.search,
          services: params.services,
          languages: params.languages,
          minRating: params.minRating,
          sortBy: params.sortBy || 'newest',
          page: undefined,
        },
        replace: true 
      });
    }, searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [selectedCity, searchQuery, selectedServices, selectedLanguages, minRating, sortBy, navigate]);

  const clearFilters = () => {
    setSelectedCity("all");
    setSearchQuery("");
    setSelectedServices([]);
    setSelectedLanguages([]);
    setMinRating("all");
    setSortBy("newest");
    navigate({ 
      to: '/',
      search: { city: undefined, search: undefined, services: undefined, languages: undefined, minRating: undefined, sortBy: 'newest', page: undefined },
      replace: true 
    });
  };

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case "city":
        setSelectedCity("all");
        break;
      case "search":
        setSearchQuery("");
        break;
      case "service":
        setSelectedServices((prev) => prev.filter((s) => s !== value));
        break;
      case "language":
        setSelectedLanguages((prev) => prev.filter((l) => l !== value));
        break;
      case "rating":
        setMinRating("all");
        break;
      case "sort":
        setSortBy("newest");
        break;
    }
  };

  const hasActiveFilters =
    selectedCity !== "all" ||
    searchQuery ||
    selectedServices.length > 0 ||
    selectedLanguages.length > 0 ||
    minRating !== "all" ||
    sortBy !== "newest";

  return (
    <div className="mb-8 space-y-4">
      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCity !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {cities.find((c) => c === selectedCity) || selectedCity}
              <button
                onClick={() => removeFilter("city")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button
                onClick={() => removeFilter("search")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedServices.map((service) => (
            <Badge key={service} variant="secondary" className="gap-1">
              {service}
              <button
                onClick={() => removeFilter("service", service)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedLanguages.map((language) => (
            <Badge key={language} variant="secondary" className="gap-1">
              {language}
              <button
                onClick={() => removeFilter("language", language)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {minRating !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {minRating}+ Stars
              <button
                onClick={() => removeFilter("rating")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {sortBy !== "newest" && (
            <Badge variant="secondary" className="gap-1">
              Sort: {sortBy === "rating" ? "Highest Rated" : sortBy === "reviews" ? "Most Reviews" : "Name"}
              <button
                onClick={() => removeFilter("sort")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}

      <Card className="border">
        <CardContent className="p-6">
          <div className="space-y-5">
            {/* Search and Basic Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="search" className="text-sm">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      // Delay hiding to allow click event to register
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="Search clinics..."
                    className="pl-9 h-9"
                    autoComplete="off"
                  />
                  {/* Autocomplete Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden">
                      {suggestions.map((clinic) => (
                        <div
                          key={clinic.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => {
                            navigate({ to: '/clinics/$slug', params: { slug: clinic.slug } });
                            setShowSuggestions(false);
                          }}
                        >
                          <div className="h-10 w-10 bg-muted rounded-md overflow-hidden flex-shrink-0">
                            {clinic.images[0] ? (
                              <img src={clinic.images[0]} alt={clinic.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-secondary" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm line-clamp-1">{clinic.name}</div>
                            <div className="text-xs text-muted-foreground">{clinic.city}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-sm">City</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger id="city" className="h-9">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="minRating" className="text-sm">Minimum Rating</Label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger id="minRating" className="h-9">
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="5">5 Stars Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sortBy" className="text-sm">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sortBy" className="h-9">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="reviews">Most Reviews</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
                  Advanced Filters
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Services */}
                    <div className="space-y-2">
                      <Label className="text-sm">Services</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {COMMON_SERVICES.map((service) => (
                          <div key={service} className="flex items-center space-x-2">
                            <Checkbox
                              id={`service-${service}`}
                              checked={selectedServices.includes(service)}
                              onCheckedChange={() => handleServiceToggle(service)}
                            />
                            <Label
                              htmlFor={`service-${service}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {service}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-2">
                      <Label className="text-sm">Languages Spoken</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {COMMON_LANGUAGES.map((language) => (
                          <div key={language} className="flex items-center space-x-2">
                            <Checkbox
                              id={`language-${language}`}
                              checked={selectedLanguages.includes(language)}
                              onCheckedChange={() => handleLanguageToggle(language)}
                            />
                            <Label
                              htmlFor={`language-${language}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {language}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
