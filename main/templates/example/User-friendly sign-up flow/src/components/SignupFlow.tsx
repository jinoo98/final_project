import { VisualPanel } from "./VisualPanel";
import { SignupPanel } from "./SignupPanel";

export function SignupFlow() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Visual Storytelling */}
      <VisualPanel />
      
      {/* Right Panel - Signup Form */}
      <SignupPanel />
    </div>
  );
}
