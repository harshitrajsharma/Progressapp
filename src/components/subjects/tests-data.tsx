import { useState } from "react";
import { format } from "date-fns";
import { Calculator, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BaseTest } from "@/types/prisma/test";
import { calculateTestStats } from "@/lib/calculations/tests";

interface TestsDataProps {
  subjectId: string;
  weightage: number;
  tests: BaseTest[];
  onAddTest: (test: Omit<BaseTest, "id" | "createdAt" | "updatedAt">) => void;
  onDeleteTest: (testId: string) => void;
}

interface TestFormData {
  name: string;
  marksScored: string;
  totalMarks: string;
}

export function TestsData({ 
  subjectId, 
  weightage, 
  tests, 
  onAddTest, 
  onDeleteTest 
}: TestsDataProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<BaseTest | null>(null);
  const [formData, setFormData] = useState<TestFormData>({
    name: "",
    marksScored: "",
    totalMarks: ""
  });

  const stats = calculateTestStats(tests, weightage);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTest = () => {
    const marksScored = parseFloat(formData.marksScored);
    const totalMarks = parseInt(formData.totalMarks);

    if (isNaN(marksScored) || isNaN(totalMarks) || !formData.name) return;

    const score = (marksScored / totalMarks) * 100;

    onAddTest({
      name: formData.name,
      subjectId,
      marksScored,
      totalMarks,
      score
    });

    setIsAddDialogOpen(false);
    setFormData({
      name: "",
      marksScored: "",
      totalMarks: ""
    });
  };

  const handleDeleteClick = (test: BaseTest) => {
    setTestToDelete(test);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (testToDelete) {
      onDeleteTest(testToDelete.id);
      setIsDeleteDialogOpen(false);
      setTestToDelete(null);
    }
  };

  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Tests Data</h3>
        <Button 
          variant="default" 
          onClick={() => setIsAddDialogOpen(true)}
          className="text-sm bg-black text-white hover:bg-black/90 rounded-md"
        >
          + Add Test
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        {/* Expected Marks Card - Takes 5 columns */}
        <Card className="md:col-span-5 p-4 space-y-3 bg-card/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calculator className="w-4 h-4" />
            <span className="text-sm">Expected Marks Calculation</span>
          </div>
          <div className="space-y-1 text-muted-foreground">
            <div>Subject Weightage: {weightage} marks</div>
            <div>Average Performance: {Math.round(stats.averagePerformance * 100)}%</div>
          </div>
          <div className="text-base font-medium border-t pt-2">
            Expected Marks: {stats.expectedMarks}/{weightage}
          </div>
        </Card>

        {/* Stats Grid - Takes 7 columns */}
        <div className="md:col-span-7 grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card/50">
            <div className="text-sm text-muted-foreground">Total Tests</div>
            <div className="text-2xl font-semibold mt-1">
              {stats.totalTests}
            </div>
          </Card>

          <Card className="p-4 bg-card/50">
            <div className="text-sm text-muted-foreground">Highest Score</div>
            <div className="text-2xl font-semibold text-green-500 mt-1">
              {Math.round(stats.highestScore)}%
            </div>
          </Card>

          <Card className="p-4 bg-card/50">
            <div className="text-sm text-muted-foreground">Average Score</div>
            <div className="text-2xl font-semibold text-amber-500 mt-1">
              {Math.round(stats.averageScore)}%
            </div>
          </Card>

          <Card className="p-4 bg-card/50">
            <div className="text-sm text-muted-foreground">Lowest Score</div>
            <div className="text-2xl font-semibold text-red-500 mt-1">
              {Math.round(stats.lowestScore)}%
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-2 mt-6">
        {[...tests].reverse().map((test) => (
          <Card
            key={test.id}
            className="flex items-center justify-between p-4 bg-card/50"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{test.name}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(test.createdAt), "dd/MM/yyyy")}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Marks: {test.marksScored}/{test.totalMarks}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-lg font-medium text-amber-500">
                {Math.round(test.score)}%
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDeleteClick(test)}
                className="h-8 w-8 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Test</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Test Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Test 1"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marksScored">Marks Obtained</Label>
                <Input
                  id="marksScored"
                  name="marksScored"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.marksScored}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  name="totalMarks"
                  type="number"
                  placeholder="100"
                  value={formData.totalMarks}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-black text-white hover:bg-black/90"
              onClick={handleAddTest}
              disabled={!formData.name || !formData.marksScored || !formData.totalMarks}
            >
              Add Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &rdquo;{testToDelete?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 