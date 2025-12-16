export interface FeatureState {
  enabled: boolean;
  label: string;
}

export const votingFeature: FeatureState = {
  enabled: false,
  label: 'Voting'
};
