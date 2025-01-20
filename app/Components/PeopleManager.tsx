import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { Person, PeopleManagerProps } from "../types";

export function PeopleManager({ people, onAddPerson }: PeopleManagerProps) {
  const [newPerson, setNewPerson] = useState<Person>({
    name: "",
    age: 0,
    keyActivities: [],
    goals: []
  });

  const [activity, setActivity] = useState("");
  const [goal, setGoal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.name || newPerson.age <= 0) return;
    onAddPerson(newPerson);
    setNewPerson({
      name: "",
      age: 0,
      keyActivities: [],
      goals: []
    });
  };

  const addActivity = () => {
    if (activity.trim()) {
      setNewPerson({
        ...newPerson,
        keyActivities: [...newPerson.keyActivities, activity.trim()]
      });
      setActivity("");
    }
  };

  const removeActivity = (index: number) => {
    setNewPerson({
      ...newPerson,
      keyActivities: newPerson.keyActivities.filter((_, i) => i !== index)
    });
  };

  const addGoal = () => {
    if (goal.trim()) {
      setNewPerson({
        ...newPerson,
        goals: [...newPerson.goals, goal.trim()]
      });
      setGoal("");
    }
  };

  const removeGoal = (index: number) => {
    setNewPerson({
      ...newPerson,
      goals: newPerson.goals.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Existing People List */}
      <div className="grid grid-cols-1 gap-4">
        {people.map((person) => (
          <Card key={person.name}>
            <CardHeader>
              <CardTitle>{person.name}</CardTitle>
              <CardDescription>Age: {person.age}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Key Activities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {person.keyActivities.map((activity, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Goals:</h4>
                  <div className="flex flex-wrap gap-2">
                    {person.goals.map((goal, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Person Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Create the  people who are part of your scenario for system design</Label>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newPerson.name}
              onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
              placeholder="Enter name"
              required
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="1"
              value={newPerson.age || ""}
              onChange={(e) => setNewPerson({ ...newPerson, age: parseInt(e.target.value) || 0 })}
              placeholder="Enter age"
              required
            />
          </div>

          <div>
            <Label htmlFor="activity">Key Activities</Label>
            <div className="flex gap-2">
              <Input
                id="activity"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Add activity"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addActivity();
                  }
                }}
              />
              <Button type="button" onClick={addActivity}>
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {newPerson.keyActivities.map((act, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                >
                  {act}
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="goal">Goals</Label>
            <div className="flex gap-2">
              <Input
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Add goal"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGoal();
                  }
                }}
              />
              <Button type="button" onClick={addGoal}>
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {newPerson.goals.map((g, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit">Add Person</Button>
      </form>
    </div>
  );
}