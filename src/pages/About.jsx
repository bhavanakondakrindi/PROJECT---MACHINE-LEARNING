import React from 'react';
import {
  Info,
  GraduationCap,
  Layers,
  Code2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6">
      {/* Project Identity Card */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              BTech Final Year Machine Learning Project
            </span>
            <h2 className="text-lg font-bold text-navy-800">
              Traffic Flow Data Visualization Using PCA and t-SNE
            </h2>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Academic Domain</span>
            <div className="font-semibold text-navy-800 mt-0.5">
              Machine Learning & Data Visualization
            </div>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Application Area</span>
            <div className="font-semibold text-navy-800 mt-0.5">
              Intelligent Transportation Systems (VANET)
            </div>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Core Methodology</span>
            <div className="font-semibold text-navy-800 mt-0.5">
              Dimensionality Reduction (PCA & t-SNE)
            </div>
          </div>
        </div>
      </div>

      {/* Project Objective */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-borderSubtle mb-3">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-navy-800">Project Objective & Purpose</h3>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          The primary objective of this project is to investigate and visualize complex, high-dimensional vehicular traffic flow data across modern intelligent transportation systems. By transforming 24 continuous vehicular, spatial, environmental, and vehicular ad-hoc network (VANET) communication attributes into two-dimensional visual representations, the application allows engineers, researchers, and traffic operators to uncover non-linear cluster structures, boundary transitions, and patterns among four distinct traffic conditions: <strong className="text-emerald-700">Free-flow</strong>, <strong className="text-blue-700">Moderate</strong>, <strong className="text-amber-700">Heavy</strong>, and <strong className="text-red-700">Gridlock</strong>.
        </p>
      </div>

      {/* Technology Stack & Architecture Clarity */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-borderSubtle mb-4">
          <Code2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-bold text-navy-800">
            Technology Stack & Implementation Architecture
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-navy-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Original Python Implementation (Model & Study)
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              The exploratory mathematical research and baseline algorithms were originally developed in Python using Google Colab and Jupyter Notebooks with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-mono text-[11px]">
              <li><strong>Python 3.11</strong> core runtime</li>
              <li><strong>Pandas & NumPy:</strong> Matrix manipulations & tabular I/O</li>
              <li><strong>Scikit-Learn:</strong> StandardScaler, PCA, TSNE, StratifiedShuffleSplit</li>
              <li><strong>Matplotlib & Seaborn:</strong> Static projection plots</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
            <h4 className="font-bold text-navy-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              Interactive Frontend Web Application (Dashboard)
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              This web application serves as the complete interactive evaluation interface, engineered entirely for local execution in VS Code without requiring external cloud accounts or paid APIs:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-mono text-[11px]">
              <li><strong>React 18 & Vite:</strong> Ultra-fast component architecture</li>
              <li><strong>Tailwind CSS:</strong> Analytical design system & Inter typography</li>
              <li><strong>Plotly.js (WebGL):</strong> High-performance 2D scatter plots (scattergl)</li>
              <li><strong>Recharts:</strong> Statistical donut, bar, and scree charts</li>
              <li><strong>Papa Parse:</strong> Streaming browser-side CSV parser</li>
              <li><strong>Web Workers:</strong> Genuine client-side multithreaded PCA and t-SNE</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Scope Boundaries (Academic Honesty) */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-borderSubtle mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-navy-800">
            Project Scope & Ethical Machine Learning Boundaries
          </h3>
        </div>

        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
          In strict compliance with academic research standards and machine learning project integrity:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <h5 className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Included in Project Scope
            </h5>
            <ul className="list-disc list-inside space-y-1 text-emerald-900 text-[11px]">
              <li>Unsupervised dimensionality reduction with PCA & t-SNE</li>
              <li>Feature variance calculation and scree plot analysis</li>
              <li>Representative stratified sampling preservation</li>
              <li>Visual comparative evaluation between linear and non-linear manifolds</li>
              <li>Domain quality checking and negative sensor validation</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
            <h5 className="font-bold text-amber-800 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Explicitly Excluded from Scope
            </h5>
            <ul className="list-disc list-inside space-y-1 text-amber-900 text-[11px]">
              <li>No claims of real-time predictive traffic forecasting</li>
              <li>No synthetic or fabricated classification accuracy scores</li>
              <li>No confusion matrices or supervised predictive models</li>
              <li>No automated signal actuator or traffic light control</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Future Scope */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-borderSubtle mb-3">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-navy-800">Future Scope & Potential Extensions</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <h5 className="font-bold text-navy-800 mb-1">Additional Manifold Methods</h5>
            <p className="text-slate-500 text-[11px]">
              Integration of UMAP (Uniform Manifold Approximation and Projection) and Kernel PCA for complex polynomial embeddings.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <h5 className="font-bold text-navy-800 mb-1">Density-Based Clustering</h5>
            <p className="text-slate-500 text-[11px]">
              Applying HDBSCAN or DBSCAN directly upon low-dimensional embeddings to discover unlabelled spatial bottlenecks.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <h5 className="font-bold text-navy-800 mb-1">Live Sensor Telemetry</h5>
            <p className="text-slate-500 text-[11px]">
              Streaming WebSocket pipelines connecting real-time edge RSU (Roadside Unit) wireless traffic detectors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
