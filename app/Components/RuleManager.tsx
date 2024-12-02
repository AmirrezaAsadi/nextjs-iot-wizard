import { useState } from "react";
import { Rule } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
interface RuleManagerProps {
    rules: Rule[];
    onUpdateRules: (rules: Rule[]) => void;
  }
  
  export function RuleManager({ rules, onUpdateRules }: RuleManagerProps) {
    const toggleRule = (index: number) => {
      const newRules = [...rules];
      newRules[index].isActive = !newRules[index].isActive;
      onUpdateRules(newRules);
    };
  
    const [newRule, setNewRule] = useState<Rule>({
      name: "",
      description: "",
      isActive: true
    });
  
    const handleAddRule = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdateRules([...rules, newRule]);
      setNewRule({ name: "", description: "", isActive: true });
    };
  
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {rules.map((rule, index) => (
            <Card key={rule.name}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{rule.name}</CardTitle>
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleRule(index)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p>{rule.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
  
        <form onSubmit={handleAddRule} className="space-y-4">
          <div>
            <Label>Rule Name</Label>
            <Input
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              placeholder="Enter rule name: Rules can be the rules the IOT system should follow or the rules governing the system environment such as pollution, events, etc"
              required
            />
          </div>
  
          <div>
            <Label>Description</Label>
            <Input
              value={newRule.description}
              onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              placeholder="Enter rule description"
              required
            />
          </div>
  
          <Button type="submit">Add Rule</Button>
        </form>
      </div>
    );
  }