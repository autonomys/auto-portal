import React from "react";
import { Layout } from "./components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "./App.css";

const App: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 font-sans">
              Manage your staking positions and discover operators
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-sans">
                Total Staked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">0 AI3</div>
              <p className="text-xs text-muted-foreground font-sans">
                Across all positions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-sans">
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success-600 font-mono">
                0 AI3
              </div>
              <p className="text-xs text-muted-foreground font-sans">
                Lifetime rewards
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium font-sans">
                Active Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">0</div>
              <p className="text-xs text-muted-foreground font-sans">
                Staking positions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CardTitle className="mb-2 font-serif">Start Staking</CardTitle>
              <CardDescription className="mb-4 font-sans">
                Connect your wallet to begin staking with Autonomys operators
              </CardDescription>
              <Button size="lg" className="font-sans">
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default App;
