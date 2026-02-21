export enum Architecture {
  cleanArchitecture = 'cleanArchitecture',
  featureBased = 'featureBased',
  atomicDesign = 'atomicDesign',
  mvvm = 'mvvm',
}

export enum StateManagement {
  redux = 'redux',
  zustand = 'zustand',
  context = 'context',
}

export enum Routing {
  reactNavigation = 'reactNavigation',
  expoRouter = 'expoRouter',
}

export interface GeneratorConfig {
  architecture: Architecture;
  stateManagement: StateManagement;
  routing: Routing;
  localization: boolean;
  firebase: boolean;
  tests: boolean;
}

/**
 * Friendly display names for architecture choices.
 */
export const ArchitectureLabels: Record<Architecture, string> = {
  [Architecture.cleanArchitecture]: '🏛️  Clean Architecture (Domain → Data → Presentation)',
  [Architecture.featureBased]: '📦 Feature-Based (Lightweight, flat structure)',
  [Architecture.atomicDesign]: '⚛️  Atomic Design + Feature (Atoms → Molecules → Organisms)',
  [Architecture.mvvm]: '🧩 MVVM with Hooks (Model → ViewModel → View)',
};

export const StateManagementLabels: Record<StateManagement, string> = {
  [StateManagement.redux]: 'Redux Toolkit (Professional State Management)',
  [StateManagement.zustand]: 'Zustand (Lightweight & Fast)',
  [StateManagement.context]: 'Context API (Built-in React State)',
};

export const RoutingLabels: Record<Routing, string> = {
  [Routing.reactNavigation]: 'React Navigation (Standard & Customisable)',
  [Routing.expoRouter]: 'Expo Router (File-based routing)',
};
