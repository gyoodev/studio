
"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { analyzeExerciseForm, type AnalyzeExerciseFormInput, type AnalyzeExerciseFormOutput } from '@/ai/flows/analyze-exercise-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Video, UploadCloud, Play, Pause, Volume2, VolumeX, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
// No Link component needed for this page logic directly

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const formSchema = z.object({
  exerciseName: z.string().min(3, "Exercise name must be at least 3 characters.").max(100),
  videoFile: z
    .custom<FileList>((val) => val instanceof FileList && val.length > 0, "Please select a video file.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE_BYTES, `Max file size is ${MAX_FILE_SIZE_MB}MB.`)
    .refine(
      (files) => files?.[0]?.type?.startsWith("video/"),
      "Only video files are accepted."
    ),
});

type FormData = z.infer<typeof formSchema>;

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function FormCheckPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeExerciseFormOutput | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isVoiceCoachPlaying, setIsVoiceCoachPlaying] = useState(false);
  const [isVoiceCoachMuted, setIsVoiceCoachMuted] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exerciseName: "",
    },
  });

  useEffect(() => {
    // Form reset is handled by AuthGuard if user is not present.
    setAnalysisResult(null);
  }, [user]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
     // AuthGuard ensures user is present here.
    if (!user) { 
      toast({ // Fallback, should be handled by AuthGuard
        title: "Authentication Required",
        description: "Please log in to use the Form Checker.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);

    const isPaidUser = user.subscriptionPlan !== 'free' && user.subscriptionStatus === 'active';

    try {
      const videoFile = data.videoFile[0];
      const videoDataUri = await fileToDataUri(videoFile);
      
      const input: AnalyzeExerciseFormInput = {
        exerciseName: data.exerciseName,
        videoDataUri,
        isPaidUser,
      };
      const result = await analyzeExerciseForm(input);
      setAnalysisResult(result);
      toast({
        title: "Form Analysis Complete!",
        description: "Check your feedback below.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error analyzing form:", error);
      toast({
        title: "Error Analyzing Form",
        description: (error as Error).message || "Failed to analyze form. Ensure the video is clear and shows the full exercise. Supported video formats are usually MP4, MOV, WebM.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("videoFile", event.target.files as FileList, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setVideoPreview(null);
    }
  };

  return (
    <AuthGuard>
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <Video className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">Smart Form Checker</CardTitle>
            </div>
            <CardDescription>Upload a video of your exercise, and AI will analyze your form. Paid users receive more detailed feedback!</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="exerciseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Squat, Push-up, Deadlift" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="videoFile"
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Upload Video</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="video/*" 
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormDescription>Max {MAX_FILE_SIZE_MB}MB. Supported formats: MP4, MOV, WebM, etc.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {videoPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Video Preview:</p>
                    <video src={videoPreview} controls className="w-full rounded-md max-h-[400px]" />
                  </div>
                )}
                
                <Button type="submit" disabled={isLoading || authLoading} className="w-full shadow-md">
                  {(isLoading || authLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  Analyze Form
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="mt-8 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Analyzing your form... This may take a moment.</p>
          </div>
        )}

        {analysisResult && (
          <Card className="mt-8 max-w-2xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Form Analysis Feedback</CardTitle>
              <div className={`flex items-center mt-2 ${analysisResult.isCorrectForm ? 'text-green-600' : 'text-red-600'}`}>
                {analysisResult.isCorrectForm ? <CheckCircle2 className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
                <span>{analysisResult.isCorrectForm ? 'Form Looks Good!' : 'Needs Improvement'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">AI Feedback:</h3>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm font-mono">{analysisResult.feedback}</pre>
              
              <div className="mt-6 border-t pt-4">
                <h4 className="text-lg font-semibold mb-2">Voice Coach (Demo)</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Button variant="outline" size="icon" onClick={() => setIsVoiceCoachPlaying(!isVoiceCoachPlaying)}>
                    {isVoiceCoachPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    <span className="sr-only">{isVoiceCoachPlaying ? 'Pause' : 'Play'} Voice Coach</span>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setIsVoiceCoachMuted(!isVoiceCoachMuted)}>
                    {isVoiceCoachMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    <span className="sr-only">{isVoiceCoachMuted ? 'Unmute' : 'Mute'} Voice Coach</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {isVoiceCoachPlaying && !isVoiceCoachMuted ? "Audio cues would play here: 'Keep your back straight... Deeper squat...'" : "Voice coach is paused or muted."}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start space-y-1">
              <p className="text-xs text-muted-foreground">
                AI form analysis is a tool, not a replacement for professional advice. Ensure good lighting and clear view for best results.
              </p>
              {(user && user.subscriptionPlan === 'free' && user.subscriptionStatus === 'active') && 
              <p className="text-xs text-muted-foreground">This is basic feedback. Upgrade to a paid subscription for more detailed analysis!</p>}
              {(user && user.subscriptionPlan !== 'free' && user.subscriptionStatus === 'active') && 
              <p className="text-xs text-accent">You're receiving enhanced feedback thanks to your subscription!</p>}
            </CardFooter>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
}

