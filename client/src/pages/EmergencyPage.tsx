import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertEmergencyContactSchema } from "@shared/schema";
import { Phone, MapPin, AlertTriangle, Plus, Edit, Trash2, User, Heart } from "lucide-react";
import type { EmergencyContact } from "@shared/schema";
import { z } from "zod";

const emergencyContactFormSchema = insertEmergencyContactSchema;

export default function EmergencyPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Mock user ID for demo
  const userId = "demo-user-123";

  const { data: emergencyContacts = [], isLoading } = useQuery<EmergencyContact[]>({
    queryKey: ["/api/emergency-contacts", userId],
    enabled: !!userId
  });

  const form = useForm({
    resolver: zodResolver(emergencyContactFormSchema),
    defaultValues: {
      userId,
      name: "",
      relationship: "",
      phone: "",
      isPrimary: false
    }
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emergencyContactFormSchema>) => {
      const response = await apiRequest("POST", "/api/emergency-contacts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-contacts", userId] });
      setIsAddDialogOpen(false);
      form.reset();
    }
  });

  const onSubmit = (data: z.infer<typeof emergencyContactFormSchema>) => {
    createContactMutation.mutate(data);
  };

  const callEmergency = () => {
    window.location.href = 'tel:108';
  };

  const callContact = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const findNearestHospital = () => {
    // Navigate to facility finder with emergency filter
    window.location.href = '/facilities?type=emergency';
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Emergency Support
          </h1>
          <p className="text-muted-foreground">
            Quick access to emergency services and medical information
          </p>
        </div>

        {/* Emergency Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-red-200 bg-red-50" data-testid="card-emergency-call">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-900 mb-2">Emergency Call</h3>
              <p className="text-red-700 mb-6">Direct access to emergency services</p>
              <Button 
                onClick={callEmergency}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/50 border-2 border-red-400 w-full"
                data-testid="button-call-emergency"
              >
                🚨 Call 108
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50" data-testid="card-nearest-hospital">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Nearest Hospital</h3>
              <p className="text-blue-700 mb-6">Find the closest medical facility</p>
              <Button 
                onClick={findNearestHospital}
                className="bg-medical-blue text-white hover:bg-medical-blue/80 w-full px-8 py-4 rounded-xl text-xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-medical-blue/50 border-2 border-blue-400"
                data-testid="button-find-hospital"
              >
                🏥 Find Hospital
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50" data-testid="card-medical-info">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">Medical Info</h3>
              <p className="text-green-700 mb-6">Share your medical information</p>
              <Button 
                className="bg-health-green text-white hover:bg-health-green/80 w-full px-8 py-4 rounded-xl text-xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-health-green/50 border-2 border-green-400"
                data-testid="button-share-medical-info"
              >
                📋 Share Medical Info
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Emergency Contacts List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Emergency Contacts</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-contact">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Emergency Contact</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} data-testid="input-contact-name" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="relationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger data-testid="select-relationship">
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="spouse">Spouse</SelectItem>
                                  <SelectItem value="parent">Parent</SelectItem>
                                  <SelectItem value="child">Child</SelectItem>
                                  <SelectItem value="sibling">Sibling</SelectItem>
                                  <SelectItem value="friend">Friend</SelectItem>
                                  <SelectItem value="doctor">Doctor</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                type="tel" 
                                placeholder="+91-98765-43210" 
                                {...field} 
                                data-testid="input-contact-phone"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                          data-testid="button-cancel-contact"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createContactMutation.isPending}
                          data-testid="button-save-contact"
                        >
                          {createContactMutation.isPending ? "Adding..." : "Add Contact"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading emergency contacts...</div>
              </div>
            ) : emergencyContacts.length === 0 ? (
              <Card className="text-center py-12" data-testid="card-empty-contacts">
                <CardContent>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Emergency Contacts</h3>
                  <p className="text-muted-foreground mb-6">
                    Add trusted contacts who can be reached during emergencies
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-contact">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Contact
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {emergencyContacts.map((contact) => (
                  <Card key={contact.id} className="medical-card" data-testid={`card-contact-${contact.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{contact.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {contact.relationship}
                            </p>
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => callContact(contact.phone)}
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-call-${contact.id}`}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-edit-${contact.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-${contact.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Information Sidebar */}
          <div className="space-y-6">
            <Card data-testid="card-emergency-info">
              <CardHeader>
                <CardTitle className="text-red-600">Emergency Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">When to Call 108:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Chest pain or heart attack symptoms</li>
                    <li>• Difficulty breathing</li>
                    <li>• Severe bleeding</li>
                    <li>• Loss of consciousness</li>
                    <li>• Severe allergic reactions</li>
                    <li>• Suspected stroke</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Stay Calm:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Speak clearly and slowly</li>
                    <li>• Provide your exact location</li>
                    <li>• Don't hang up until told to do so</li>
                    <li>• Follow dispatcher instructions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-medical-id">
              <CardHeader>
                <CardTitle>Medical ID</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Keep important medical information easily accessible for emergency responders.
                </p>
                <Button variant="outline" className="w-full" data-testid="button-setup-medical-id">
                  Setup Medical ID
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-location-sharing">
              <CardHeader>
                <CardTitle>Location Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your location with emergency contacts during critical situations.
                </p>
                <Button variant="outline" className="w-full" data-testid="button-enable-location">
                  Enable Location Sharing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
