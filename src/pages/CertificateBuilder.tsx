import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Award, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const CertificateBuilder = () => {
  const [releaseOption, setReleaseOption] = useState("completion");
  const [minQuizScore, setMinQuizScore] = useState([80]);
  const [minMastery, setMinMastery] = useState([75]);
  const [confidenceThreshold, setConfidenceThreshold] = useState([60]);
  const [minAttempts, setMinAttempts] = useState([1]);
  const [noMisconceptions, setNoMisconceptions] = useState(true);
  const [requireAllModules, setRequireAllModules] = useState(true);

  const allMet = minQuizScore[0] >= 70 && minMastery[0] >= 70;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Link>

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Data Security & Privacy Essentials</p>
        <h1 className="text-2xl font-bold text-foreground mt-1">Certificate Builder</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate Preview */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-card border-b p-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Preview</span>
              <Button size="sm" variant="destructive" className="h-7 text-xs">Save</Button>
            </div>
            <div className="p-8 bg-gradient-to-br from-secondary to-card min-h-[400px] flex items-center justify-center">
              <div className="bg-card border rounded-xl p-8 w-full max-w-md shadow-lg text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Certificate of Completion</p>
                <p className="text-xl font-bold text-foreground">{"{{Member_Full_Name}}"}</p>
                <p className="text-xs text-muted-foreground">For successfully completing</p>
                <p className="text-sm font-semibold text-foreground">Data Security & Privacy Essentials</p>
                <div className="pt-4 border-t">
                  <p className="text-[10px] text-muted-foreground">Issued: {"{{Completion_Date}}"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <div className="space-y-6">
          <Tabs defaultValue="release">
            <TabsList className="w-full">
              <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
              <TabsTrigger value="release" className="flex-1">Release</TabsTrigger>
              <TabsTrigger value="mastery" className="flex-1">Mastery Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="mt-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <p className="text-sm text-muted-foreground">Customize certificate template fields:</p>
                  <div className="space-y-2">
                    <Label className="text-xs">Title</Label>
                    <Input defaultValue="Certificate of Completion" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Dynamic Fields</Label>
                    <div className="flex flex-wrap gap-2">
                      {["{{Member_Full_Name}}", "{{Course_Name}}", "{{Completion_Date}}"].map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs font-mono">{f}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="release" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Release Plan</CardTitle></CardHeader>
                <CardContent>
                  <RadioGroup value={releaseOption} onValueChange={setReleaseOption} className="space-y-3">
                    {[
                      { value: "completion", label: "Release on Product Completion", desc: "Certificates released when curriculum is completed by the member." },
                      { value: "end-date", label: "Release on Product End Date", desc: "Only for products with a fixed duration." },
                      { value: "schedule", label: "Schedule Release", desc: "Released on a custom date and time." },
                      { value: "immediate", label: "Release Immediately", desc: "Instantly visible; you won't be able to edit." },
                      { value: "tbd", label: "TBD / Unscheduled", desc: "Release plan to be determined later." },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                        <RadioGroupItem value={opt.value} className="mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mastery" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" /> Mastery-Based Restrictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Minimum Quiz Score</Label>
                      <span className="text-sm font-semibold text-foreground">{minQuizScore[0]}%</span>
                    </div>
                    <Slider value={minQuizScore} onValueChange={setMinQuizScore} max={100} step={5} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Minimum Mastery Score</Label>
                      <span className="text-sm font-semibold text-foreground">{minMastery[0]}%</span>
                    </div>
                    <Slider value={minMastery} onValueChange={setMinMastery} max={100} step={5} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Confidence Threshold</Label>
                      <span className="text-sm font-semibold text-foreground">{confidenceThreshold[0]}%</span>
                    </div>
                    <Slider value={confidenceThreshold} onValueChange={setConfidenceThreshold} max={100} step={5} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">Minimum Quiz Attempts</Label>
                      <span className="text-sm font-semibold text-foreground">{minAttempts[0]}</span>
                    </div>
                    <Slider value={minAttempts} onValueChange={setMinAttempts} min={1} max={5} step={1} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">No Critical Misconceptions</Label>
                      <p className="text-xs text-muted-foreground">Block if concept flagged as misunderstood</p>
                    </div>
                    <Switch checked={noMisconceptions} onCheckedChange={setNoMisconceptions} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Require All Modules</Label>
                      <p className="text-xs text-muted-foreground">All modules must be completed</p>
                    </div>
                    <Switch checked={requireAllModules} onCheckedChange={setRequireAllModules} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h4 className="text-sm font-semibold mb-3 text-foreground">Rule Preview</h4>
                  <div className="bg-secondary rounded-lg p-4 space-y-2 text-xs">
                    <p className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-success" /> Course completed</p>
                    <p className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-success" /> Average score ≥ {minQuizScore[0]}%</p>
                    <p className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-success" /> Mastery score ≥ {minMastery[0]}%</p>
                    <p className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-success" /> Confidence ≥ {confidenceThreshold[0]}%</p>
                    {noMisconceptions && <p className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-success" /> No concept flagged as misunderstood</p>}
                    <p className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-success" /> Min {minAttempts[0]} quiz attempt(s)</p>
                  </div>
                  <div className="mt-3 p-3 border rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      If requirements are not met, the certificate will be locked and the student will receive recommended remediation content.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">Cancel</Button>
            <Button className="flex-1">Create Certificate</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateBuilder;
