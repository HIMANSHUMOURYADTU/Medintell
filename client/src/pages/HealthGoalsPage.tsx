import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { insertHealthGoalSchema } from "@shared/schema";
import { Plus, Target, TrendingUp, Award, Edit, Trash2 } from "lucide-react";
import type { HealthGoal } from "@shared/schema";
import { z } from "zod";

const healthGoalFormSchema = insertHealthGoalSchema.extend({
  targetValue: z.number().min(1),
  currentValue: z.number().min(0).default(0)
});

export default function HealthGoalsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Mock user ID for demo
  const userId = "demo-user-123";

  const { data: healthGoals = [], isLoading } = useQuery<HealthGoal[]>({
    queryKey: ["/api/health-goals", userId],
    enabled: !!userId
  });

  const form = useForm({
    resolver: zodResolver(healthGoalFormSchema),
    defaultValues: {
      userId,
      title: "",
      description: "",
      targetValue: 1,
      currentValue: 0,
      unit: "",
      completed: false
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof healthGoalFormSchema>) => {
      const response = await apiRequest("POST", "/api/health-goals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-goals", userId] });
      setIsAddDialogOpen(false);
      form.reset();
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HealthGoal> }) => {
      const response = await apiRequest("PATCH", `/api/health-goals/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-goals", userId] });
    }
  });

  const onSubmit = (data: z.infer<typeof healthGoalFormSchema>) => {
    createGoalMutation.mutate(data);
  };

  const updateProgress = (goal: HealthGoal, newValue: number) => {
    const completed = newValue >= (goal.targetValue || 1);
    updateGoalMutation.mutate({
      id: goal.id,
      updates: { currentValue: newValue, completed }
    });
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getGoalTypeIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('step') || lower.includes('walk')) return '👟';
    if (lower.includes('water') || lower.includes('drink')) return '💧';
    if (lower.includes('sleep')) return '😴';
    if (lower.includes('weight')) return '⚖️';
    if (lower.includes('exercise') || lower.includes('workout')) return '💪';
    if (lower.includes('medication') || lower.includes('pill')) return '💊';
    return '🎯';
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
              Health Goals
            </h1>
            <p className="text-muted-foreground">
              Track your progress and achieve your health objectives
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-health-green hover:bg-health-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-green-300" data-testid="button-add-goal">
                <Plus className="w-4 h-4 mr-2" />
                🎯 Add Health Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Health Goal</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Walk 10,000 steps daily" {...field} data-testid="input-goal-title" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Add more details about your goal" {...field} data-testid="input-goal-description" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="targetValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Value</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="10000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              data-testid="input-target-value"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger data-testid="select-goal-unit">
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="steps">Steps</SelectItem>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="glasses">Glasses</SelectItem>
                                <SelectItem value="kg">Kilograms</SelectItem>
                                <SelectItem value="lbs">Pounds</SelectItem>
                                <SelectItem value="pills">Pills</SelectItem>
                                <SelectItem value="times">Times</SelectItem>
                              </SelectContent>
                            </Select>
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
                      data-testid="button-cancel-goal"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createGoalMutation.isPending}
                      data-testid="button-save-goal"
                    >
                      {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card data-testid="card-total-goals">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Goals</p>
                  <p className="text-3xl font-bold text-foreground">{healthGoals.length}</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-completed-goals">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {healthGoals.filter(goal => goal.completed).length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-success-rate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {healthGoals.length > 0 
                      ? Math.round((healthGoals.filter(goal => goal.completed).length / healthGoals.length) * 100)
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Goals List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-muted-foreground">Loading health goals...</div>
          </div>
        ) : healthGoals.length === 0 ? (
          <Card className="text-center py-12" data-testid="card-empty-goals">
            <CardContent>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Health Goals Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your health journey by creating your first goal
              </p>
              <Button className="bg-health-green hover:bg-health-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => setIsAddDialogOpen(true)} data-testid="button-create-first-goal">
                <Plus className="w-4 h-4 mr-2" />
                🎯 Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthGoals.map((goal) => (
              <Card key={goal.id} className="medical-card" data-testid={`card-goal-${goal.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getGoalTypeIcon(goal.title)}</div>
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={goal.completed ? "default" : "secondary"}>
                      {goal.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">
                          {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(goal.currentValue || 0, goal.targetValue || 1)}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(getProgressPercentage(goal.currentValue || 0, goal.targetValue || 1))}% complete
                      </p>
                    </div>

                    {/* Update Progress */}
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Update progress"
                        className="flex-1"
                        onBlur={(e) => {
                          const newValue = parseInt(e.target.value);
                          if (newValue >= 0) {
                            updateProgress(goal, newValue);
                            e.target.value = "";
                          }
                        }}
                        data-testid={`input-progress-${goal.id}`}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateProgress(goal, (goal.currentValue || 0) + 1)}
                        data-testid={`button-increment-${goal.id}`}
                      >
                        +1
                      </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${goal.id}`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${goal.id}`}
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
      </div>
    </div>
  );
}
