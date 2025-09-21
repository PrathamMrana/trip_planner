"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, DollarSign, Calendar, Star, ExternalLink, Plane, Camera, Users, Utensils } from "lucide-react"
import useSWR from "swr"

interface ItineraryDetailProps {
  itineraryId: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const activityIcons = {
  sightseeing: Camera,
  heritage: Star,
  cultural: Star,
  food: Utensils,
  relaxation: Clock,
  adventure: MapPin,
  shopping: DollarSign,
  transport: Plane,
}

export function ItineraryDetail({ itineraryId }: ItineraryDetailProps) {
  const { data, error, isLoading } = useSWR(`/api/v1/itineraries/${itineraryId}`, fetcher)

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="py-12 text-center space-y-4">
          <div className="text-4xl">😔</div>
          <h3 className="text-lg font-semibold">Oops! Something went wrong</h3>
          <p className="text-muted-foreground">Failed to load itinerary details.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    )
  }

  const handleBookItinerary = () => {
    const searchQuery = `${data.tripRequest.origin} to ${data.tripRequest.destination}`
    window.open(
      `https://www.easemytrip.com/flights.html?from=${encodeURIComponent(data.tripRequest.origin)}&to=${encodeURIComponent(
        data.tripRequest.destination,
      )}`,
      "_blank",
    )
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="0" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          {data.itineraries.map((itinerary: any, index: number) => (
            <TabsTrigger
              key={index}
              value={index.toString()}
              className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="text-xl">{index === 0 ? "💰" : index === 1 ? "⚖️" : "✨"}</span>
              <span className="text-sm font-medium">
                {index === 0 ? "Budget" : index === 1 ? "Balanced" : "Premium"}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {data.itineraries.map((itinerary: any, index: number) => (
          <TabsContent key={index} value={index.toString()} className="space-y-8 mt-8">
            {/* Itinerary Header */}
            <Card className="overflow-hidden border-0 bg-card/50 backdrop-blur-sm shadow-xl">
              <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
              <CardHeader className="pb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <CardTitle className="text-3xl text-balance leading-tight">{itinerary.title}</CardTitle>
                    <CardDescription className="text-base text-pretty leading-relaxed">
                      {itinerary.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-start lg:items-end gap-3">
                    <Badge variant="outline" className="text-xl px-6 py-3 font-bold bg-primary/10 border-primary/20">
                      {itinerary.total_cost?.amount != null ? `${itinerary.total_cost.currency} ${itinerary.total_cost.amount.toLocaleString()}` : "N/A"}
                    </Badge>
                    <div className="text-sm text-muted-foreground">Total estimated cost</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{(() => {
                        const startDate = new Date(data.tripRequest.start_date);
                        const endDate = new Date(data.tripRequest.end_date);
                        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      })()}</div>
                      <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {itinerary.total_cost?.amount != null
                          ? `${itinerary.total_cost.currency} ${Math.round(itinerary.total_cost.amount / (() => {
                              const startDate = new Date(data.tripRequest.start_date);
                              const endDate = new Date(data.tripRequest.end_date);
                              const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                              return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            })())}`
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">Per day</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">{data.tripRequest.num_travelers}</div>
                      <div className="text-sm text-muted-foreground">Travelers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg">
                    <Star className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">AI</div>
                      <div className="text-sm text-muted-foreground">Curated</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="flex-1 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleBookItinerary}
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Book on EaseMyTrip
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 text-lg font-semibold border-2 bg-transparent"
                    onClick={() => window.print()}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Save Itinerary
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Day-by-Day Breakdown */}
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Day-by-Day Itinerary</h2>
                <p className="text-muted-foreground">Your personalized travel schedule</p>
              </div>

              {itinerary.days?.map((day: any, dayIndex: number) => (
                <Card key={dayIndex} className="overflow-hidden border-0 bg-card/30 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                        <span className="font-bold text-primary">{day.day || dayIndex + 1}</span>
                      </div>
                      <div>
                        <div className="text-xl">Day {day.day || dayIndex + 1}</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          {day.date
                            ? new Date(day.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              })
                            : `Day ${dayIndex + 1} Activities`}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-6">
                    {/* Daily Cost Summary */}
                    {day.daily_cost && (
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-lg">Daily Total</span>
                          </div>
                          <Badge variant="outline" className="text-lg font-bold bg-primary/20 border-primary/30">
                            {day.daily_cost.currency} {day.daily_cost.amount?.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Activities */}
                    {day.activities && day.activities.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                          <Camera className="h-5 w-5 text-primary" />
                          Activities & Experiences
                        </h4>
                        <div className="space-y-4">
                          {day.activities.map((activity: any, actIndex: number) => {
                            const IconComponent = activityIcons[activity.type as keyof typeof activityIcons] || MapPin
                            return (
                              <div
                                key={actIndex}
                                className="flex items-start gap-4 p-4 bg-background/50 rounded-lg border border-border/50"
                              >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                                  <IconComponent className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                      <h5 className="font-semibold text-lg">{activity.name}</h5>
                                      <p className="text-muted-foreground">
                                        {activity.location?.name}
                                      </p>
                                      {activity.duration && (
                                        <p className="text-sm text-muted-foreground leading-relaxed">{activity.duration}</p>
                                      )}
                                      {activity.booking_info?.bookable && (
                                        <p className="text-xs text-green-600 font-medium">
                                          ✓ Bookable via {activity.booking_info.provider}
                                        </p>
                                      )}
                                    </div>
                                    {activity.cost && (
                                      <div className="text-right">
                                        <Badge variant="outline" className="shrink-0 mb-1">
                                          {activity.cost.currency} {activity.cost.amount?.toLocaleString()}
                                        </Badge>
                                        {activity.booking_info?.bookable && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-xs h-6 px-2"
                                            onClick={() => window.open(activity.booking_info.booking_url, '_blank')}
                                          >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            Book
                                          </Button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Accommodation */}
                    {day.accommodation && (
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                          <Star className="h-5 w-5 text-primary" />
                          Accommodation
                        </h4>
                        <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <h5 className="font-semibold text-lg">{day.accommodation.name}</h5>
                              <p className="text-muted-foreground capitalize">
                                {day.accommodation.type} • {day.accommodation.location?.name}
                              </p>
                              {day.accommodation.booking_info?.bookable && (
                                <p className="text-xs text-green-600 font-medium">
                                  ✓ Bookable via {day.accommodation.booking_info.provider}
                                </p>
                              )}
                            </div>
                            {day.accommodation.cost && (
                              <div className="text-right">
                                <Badge variant="outline" className="shrink-0 mb-1">
                                  {day.accommodation.cost.currency} {day.accommodation.cost.amount?.toLocaleString()}
                                </Badge>
                                {day.accommodation.booking_info?.bookable && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-6 px-2"
                                    onClick={() => window.open(day.accommodation.booking_info.booking_url, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Book
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Meals */}
                    {day.meals && day.meals.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                          <Utensils className="h-5 w-5 text-primary" />
                          Meals
                        </h4>
                        <div className="space-y-3">
                          {day.meals.map((meal: any, mealIndex: number) => (
                            <div
                              key={mealIndex}
                              className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50"
                            >
                              <div className="space-y-1">
                                <h6 className="font-medium capitalize">{meal.type}</h6>
                                <p className="text-sm text-muted-foreground">{meal.name}</p>
                              </div>
                              {meal.cost && (
                                <Badge variant="outline" className="shrink-0">
                                  {meal.cost.currency} {meal.cost.amount?.toLocaleString()}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transportation */}
                    {day.transportation && (
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                          <Plane className="h-5 w-5 text-primary" />
                          Transportation
                        </h4>
                        <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h6 className="font-medium capitalize">{day.transportation.type.replace('_', ' ')}</h6>
                              <p className="text-sm text-muted-foreground">Day {day.day} transport</p>
                            </div>
                            {day.transportation.cost && (
                              <Badge variant="outline" className="shrink-0">
                                {day.transportation.cost.currency} {day.transportation.cost.amount?.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) || (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="text-4xl mb-4">🗓️</div>
                    <h3 className="text-lg font-semibold mb-2">Detailed Schedule Coming Soon</h3>
                    <p className="text-muted-foreground">
                      This itinerary includes amazing activities and experiences. Visit EaseMyTrip to explore and book
                      specific activities.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
              <CardContent className="py-8 text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Make This Trip Reality?</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  This AI-generated itinerary is your starting point. Visit EaseMyTrip to book flights, hotels, and
                  activities to bring your perfect trip to life.
                </p>
                <Button
                  size="lg"
                  className="mt-4 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleBookItinerary}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Start Booking on EaseMyTrip
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
