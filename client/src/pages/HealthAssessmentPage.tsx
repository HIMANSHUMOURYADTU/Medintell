import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { ClipboardList, CheckCircle, AlertTriangle, Info, ArrowLeft, ArrowRight } from "lucide-react";
import type { HealthAssessment } from "@shared/schema";

interface Question {
  id: string;
  text: string;
  type: 'radio' | 'scale';
  options?: string[];
  category: string;
}

const healthQuestions: Question[] = [
  {
    id: 'age',
    text: 'What is your age group?',
    type: 'radio',
    options: ['18-29', '30-39', '40-49', '50-59', '60-69', '70+'],
    category: 'demographics'
  },
  {
    id: 'exercise',
    text: 'How often do you exercise per week?',
    type: 'radio',
    options: ['Never', '1-2 times', '3-4 times', '5+ times'],
    category: 'lifestyle'
  },
  {
    id: 'smoking',
    text: 'Do you smoke?',
    type: 'radio',
    options: ['Never', 'Former smoker', 'Occasionally', 'Daily'],
    category: 'lifestyle'
  },
  {
    id: 'alcohol',
    text: 'How often do you consume alcohol?',
    type: 'radio',
    options: ['Never', 'Rarely', 'Weekly', 'Daily'],
    category: 'lifestyle'
  },
  {
    id: 'stress',
    text: 'How would you rate your stress level?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    category: 'mental_health'
  },
  {
    id: 'sleep',
    text: 'How many hours do you sleep per night?',
    type: 'radio',
    options: ['Less than 5', '5-6', '7-8', '9+'],
    category: 'lifestyle'
  },
  {
    id: 'chronic_conditions',
    text: 'Do you have any chronic conditions?',
    type: 'radio',
    options: ['None', 'Diabetes', 'Hypertension', 'Heart disease', 'Multiple conditions'],
    category: 'medical_history'
  },
  {
    id: 'medications',
    text: 'How many medications do you take regularly?',
    type: 'radio',
    options: ['None', '1-2', '3-5', '6+'],
    category: 'medical_history'
  },
  {
    id: 'diet',
    text: 'How would you describe your diet?',
    type: 'radio',
    options: ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent'],
    category: 'lifestyle'
  },
  {
    id: 'energy',
    text: 'How is your energy level throughout the day?',
    type: 'scale',
    options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    category: 'wellbeing'
  }
];

export default function HealthAssessmentPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [assessment, setAssessment] = useState<HealthAssessment | null>(null);
  const queryClient = useQueryClient();
  
  // Mock user ID for demo
  const userId = "demo-user-123";

  const { data: previousAssessments = [] } = useQuery<HealthAssessment[]>({
    queryKey: ["/api/health-assessments", userId],
    enabled: !!userId
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (responses: Record<string, string>) => {
      const response = await apiRequest("POST", "/api/health-assessments", {
        userId,
        responses
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAssessment(data);
      setIsComplete(true);
      queryClient.invalidateQueries({ queryKey: ["/api/health-assessments", userId] });
    }
  });

  const currentQuestion = healthQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / healthQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < healthQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Submit assessment
      submitAssessmentMutation.mutate(responses);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const restartAssessment = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setIsComplete(false);
    setAssessment(null);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isComplete && assessment) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="medical-card" data-testid="card-assessment-results">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Assessment Complete</CardTitle>
              <p className="text-muted-foreground">
                Here are your personalized health insights
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Risk Level */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {getRiskIcon(assessment.riskLevel || 'low')}
                  <Badge className={getRiskColor(assessment.riskLevel || 'low')} data-testid="badge-risk-level">
                    {assessment.riskLevel?.toUpperCase()} RISK
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on your responses, your health risk level is {assessment.riskLevel}
                </p>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Personalized Recommendations</h3>
                <div className="space-y-3">
                  {assessment.recommendations?.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-muted rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  onClick={restartAssessment}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-retake-assessment"
                >
                  Take Again
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => window.location.href = '/chat'}
                  data-testid="button-discuss-results"
                >
                  Discuss with AI Assistant
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Previous Assessments */}
          {previousAssessments.length > 0 && (
            <Card className="mt-8" data-testid="card-previous-assessments">
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {previousAssessments.slice(0, 3).map((prev, index) => (
                    <div key={prev.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getRiskIcon(prev.riskLevel || 'low')}
                        <div>
                          <p className="font-medium text-foreground">
                            {new Date(prev.completedAt!).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Risk Level: {prev.riskLevel}
                          </p>
                        </div>
                      </div>
                      <Badge className={getRiskColor(prev.riskLevel || 'low')}>
                        {prev.riskLevel?.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Health Assessment
          </h1>
          <p className="text-muted-foreground">
            Complete this assessment to receive personalized health insights
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-8" data-testid="card-progress">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {healthQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="medical-card" data-testid="card-question">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline">{currentQuestion.category.replace('_', ' ')}</Badge>
            </div>
            <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentQuestion.type === 'radio' ? (
              <RadioGroup 
                value={responses[currentQuestion.id] || ''} 
                onValueChange={handleAnswer}
                data-testid="radio-group-answer"
              >
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options?.map((option) => (
                    <div key={option} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <span className="text-sm text-muted-foreground">
                    Rate from 1 (lowest) to 10 (highest)
                  </span>
                </div>
                <RadioGroup 
                  value={responses[currentQuestion.id] || ''} 
                  onValueChange={handleAnswer}
                  data-testid="radio-group-scale"
                >
                  <div className="grid grid-cols-5 gap-2">
                    {currentQuestion.options?.map((option) => (
                      <div key={option} className="text-center">
                        <div className="flex items-center justify-center p-3 border rounded-lg hover:bg-muted cursor-pointer">
                          <RadioGroupItem value={option} id={option} />
                          <Label htmlFor={option} className="ml-2 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                data-testid="button-previous"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={!responses[currentQuestion.id] || submitAssessmentMutation.isPending}
                data-testid="button-next"
              >
                {currentQuestionIndex === healthQuestions.length - 1 ? (
                  submitAssessmentMutation.isPending ? (
                    "Analyzing..."
                  ) : (
                    "Complete Assessment"
                  )
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-8" data-testid="card-info">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">About This Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  This assessment is designed to provide general health insights and should not replace 
                  professional medical advice. Please consult with healthcare providers for medical decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
