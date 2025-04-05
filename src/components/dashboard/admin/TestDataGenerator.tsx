import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Users } from "lucide-react";
import { addParent, addChild } from "@/lib/api";

interface TestDataGeneratorProps {
  onDataGenerated: () => void;
}

export function TestDataGenerator({ onDataGenerated }: TestDataGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [parentFirstName, setParentFirstName] = useState("Test");
  const [parentLastName, setParentLastName] = useState("Parent");
  const [childFirstName, setChildFirstName] = useState("Test");
  const [childLastName, setChildLastName] = useState("Child");
  const [childAge, setChildAge] = useState("4");

  const generateTestParent = async () => {
    setIsGenerating(true);
    try {
      // Create a parent
      const email = `testparent${Date.now()}@example.com`;
      const { data: parent, error } = await addParent({
        first_name: parentFirstName,
        last_name: parentLastName,
        email: email,
        role: "parent",
        children_count: 0,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Test Parent Created",
        description: `Created parent: ${parentFirstName} ${parentLastName}`,
      });

      return parent;
    } catch (error) {
      console.error("Error creating test parent:", error);
      toast({
        title: "Error",
        description: "Failed to create test parent. See console for details.",
        variant: "destructive",
      });
      return null;
    }
  };

  const generateTestChild = async (parentId: string) => {
    try {
      // Calculate date of birth based on age
      const today = new Date();
      const birthYear = today.getFullYear() - parseInt(childAge);
      const dateOfBirth = `${birthYear}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      
      // Create a child
      const { data: child, error } = await addChild({
        parent_id: parentId,
        first_name: childFirstName,
        last_name: childLastName,
        date_of_birth: dateOfBirth,
        age_group: `${childAge}-${parseInt(childAge) + 1}`,
        allergies: "",
        special_notes: "Test child",
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Test Child Created",
        description: `Created child: ${childFirstName} ${childLastName}`,
      });

      return child;
    } catch (error) {
      console.error("Error creating test child:", error);
      toast({
        title: "Error",
        description: "Failed to create test child. See console for details.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleGenerateTestData = async () => {
    setIsGenerating(true);
    try {
      // Create a parent
      const parent = await generateTestParent();
      
      if (parent && parent.id) {
        // Create a child for this parent
        await generateTestChild(parent.id);
      }
      
      // Notify parent component to refresh data
      onDataGenerated();
    } catch (error) {
      console.error("Error generating test data:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Test Data Generator
        </CardTitle>
        <CardDescription>
          Create test parents and children for development purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Parent Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="parentFirstName">First Name</Label>
                <Input
                  id="parentFirstName"
                  value={parentFirstName}
                  onChange={(e) => setParentFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="parentLastName">Last Name</Label>
                <Input
                  id="parentLastName"
                  value={parentLastName}
                  onChange={(e) => setParentLastName(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Child Information</h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <Label htmlFor="childFirstName">First Name</Label>
                <Input
                  id="childFirstName"
                  value={childFirstName}
                  onChange={(e) => setChildFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="childLastName">Last Name</Label>
                <Input
                  id="childLastName"
                  value={childLastName}
                  onChange={(e) => setChildLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="childAge">Age</Label>
              <Input
                id="childAge"
                type="number"
                min="1"
                max="6"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleGenerateTestData} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate Test Data
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
