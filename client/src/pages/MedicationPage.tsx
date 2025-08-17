import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertMedicationSchema } from "@shared/schema";
import { Plus, Clock, Pill, AlertTriangle, Edit, Trash2, Bell } from "lucide-react";
import type { Medication } from "@shared/schema";
import { z } from "zod";

const medicationFormSchema = insertMedicationSchema.extend({
  startDate: z.string(),
  endDate: z.string().optional(),
  times: z.array(z.string()).default([])
});

export default function MedicationPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  // Mock user ID for demo
  const userId = "demo-user-123";

  const { data: medications = [], isLoading } = useQuery<Medication[]>({
    queryKey: ["/api/medications", userId],
    enabled: !!userId
  });

  const form = useForm({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      userId,
      name: "",
      dosage: "",
      frequency: "",
      times: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      active: true
    }
  });

  const createMedicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const medicationData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        times: selectedTimes
      };
      const response = await apiRequest("POST", "/api/medications", medicationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications", userId] });
      setIsAddDialogOpen(false);
      setSelectedTimes([]);
      form.reset();
    }
  });

  const updateMedicationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Medication> }) => {
      const response = await apiRequest("PATCH", `/api/medications/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications", userId] });
    }
  });

  const onSubmit = (data: z.infer<typeof medicationFormSchema>) => {
    createMedicationMutation.mutate(data);
  };

  const addTime = () => {
    const timeInput = document.getElementById('time-input') as HTMLInputElement;
    if (timeInput && timeInput.value && !selectedTimes.includes(timeInput.value)) {
      setSelectedTimes([...selectedTimes, timeInput.value]);
      timeInput.value = '';
    }
  };

  const removeTime = (time: string) => {
    setSelectedTimes(selectedTimes.filter(t => t !== time));
  };

  const toggleMedication = (medication: Medication) => {
    updateMedicationMutation.mutate({
      id: medication.id,
      updates: { active: !medication.active }
    });
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-green-100 text-green-800';
      case 'twice_daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextDose = (medication: Medication) => {
    if (!medication.times || medication.times.length === 0) return null;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const time of medication.times) {
      const [hours, minutes] = time.split(':').map(Number);
      const medicationTime = hours * 60 + minutes;
      
      if (medicationTime > currentTime) {
        return time;
      }
    }
    
    // If no time today, return first time tomorrow
    return medication.times[0];
  };

  const getUpcomingReminders = () => {
    const upcoming = [];
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const med of medications.filter(m => m.active)) {
      if (med.times) {
        for (const time of med.times) {
          const [hours, minutes] = time.split(':').map(Number);
          const medicationTime = hours * 60 + minutes;
          
          if (medicationTime > currentTime && medicationTime < currentTime + 120) { // Next 2 hours
            upcoming.push({
              medication: med,
              time: time,
              timeUntil: medicationTime - currentTime
            });
          }
        }
      }
    }
    
    return upcoming.sort((a, b) => a.timeUntil - b.timeUntil);
  };

  const upcomingReminders = getUpcomingReminders();

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
              Medication Management
            </h1>
            <p className="text-muted-foreground">
              Track your medications and never miss a dose
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-300" data-testid="button-add-medication">
                <Plus className="w-4 h-4 mr-2" />
                💊 Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Metformin" {...field} data-testid="input-medication-name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500mg" {...field} data-testid="input-dosage" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger data-testid="select-frequency">
                              <SelectValue placeholder="How often do you take this?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Once daily</SelectItem>
                              <SelectItem value="twice_daily">Twice daily</SelectItem>
                              <SelectItem value="three_times">Three times daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="as_needed">As needed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Reminder Times</FormLabel>
                    <div className="flex space-x-2 mt-2">
                      <Input
                        id="time-input"
                        type="time"
                        className="flex-1"
                        data-testid="input-reminder-time"
                      />
                      <Button type="button" onClick={addTime} data-testid="button-add-time">
                        Add
                      </Button>
                    </div>
                    {selectedTimes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTimes.map((time) => (
                          <Badge 
                            key={time} 
                            variant="secondary" 
                            className="cursor-pointer"
                            onClick={() => removeTime(time)}
                          >
                            {time} ✕
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-start-date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-end-date" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      data-testid="button-cancel-medication"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMedicationMutation.isPending}
                      data-testid="button-save-medication"
                    >
                      {createMedicationMutation.isPending ? "Adding..." : "Add Medication"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats and Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats */}
          <Card data-testid="card-total-medications">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Medications</p>
                  <p className="text-3xl font-bold text-foreground">{medications.length}</p>
                </div>
                <Pill className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-active-medications">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-600">
                    {medications.filter(med => med.active).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Reminders */}
          <Card className="lg:col-span-2" data-testid="card-upcoming-reminders">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Upcoming Reminders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReminders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No upcoming reminders in the next 2 hours</p>
              ) : (
                <div className="space-y-2">
                  {upcomingReminders.slice(0, 3).map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{reminder.medication.name}</p>
                        <p className="text-sm text-muted-foreground">{reminder.medication.dosage}</p>
                      </div>
                      <Badge variant="outline">{reminder.time}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Medications List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Loading medications...</div>
          </div>
        ) : medications.length === 0 ? (
          <Card className="text-center py-12" data-testid="card-empty-medications">
            <CardContent>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Medications Added</h3>
              <p className="text-muted-foreground mb-6">
                Start managing your medications by adding your first one
              </p>
              <Button className="bg-medical-blue hover:bg-medical-blue/90 text-white shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-medication">
                <Plus className="w-4 h-4 mr-2" />
                💊 Add Your First Medication
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((medication) => (
              <Card 
                key={medication.id} 
                className={`medical-card ${!medication.active ? 'opacity-60' : ''}`}
                data-testid={`card-medication-${medication.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Pill className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{medication.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                      </div>
                    </div>
                    <Switch
                      checked={medication.active ?? true}
                      onCheckedChange={() => toggleMedication(medication)}
                      data-testid={`switch-active-${medication.id}`}
                    />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Frequency */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Frequency</span>
                      <Badge className={getFrequencyColor(medication.frequency)}>
                        {medication.frequency.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Times */}
                    {medication.times && medication.times.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Reminder Times</p>
                        <div className="flex flex-wrap gap-1">
                          {medication.times.map((time) => (
                            <Badge key={time} variant="outline" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Dose */}
                    {medication.active && getNextDose(medication) && (
                      <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          Next dose: {getNextDose(medication)}
                        </span>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="text-xs text-muted-foreground">
                      <p>Started: {new Date(medication.startDate).toLocaleDateString()}</p>
                      {medication.endDate && (
                        <p>Ends: {new Date(medication.endDate).toLocaleDateString()}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-2">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${medication.id}`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${medication.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Medication Tips */}
        <Card className="mt-8" data-testid="card-medication-tips">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Medication Safety Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Taking Medications</h4>
                <ul className="space-y-1">
                  <li>• Take medications at the same time each day</li>
                  <li>• Don't skip doses, even if you feel better</li>
                  <li>• Take with or without food as directed</li>
                  <li>• Use a pill organizer to stay organized</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Safety Guidelines</h4>
                <ul className="space-y-1">
                  <li>• Store medications in a cool, dry place</li>
                  <li>• Check expiration dates regularly</li>
                  <li>• Don't share medications with others</li>
                  <li>• Consult your doctor before stopping</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
