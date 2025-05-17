import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateDistinctColors = (count: number): string[] => {
  const colors: string[] = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = Math.floor(i * hueStep);
    const saturation = 70 + Math.random() * 20; // 70-90%
    const lightness = 50 + Math.random() * 10; // 50-60%
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
};

export const getPartyColor = (
  partyName: string,
  index: number,
  distinctColors: string[],
): string => {
  const knownParties: Record<string, string> = {
    Republicans: '#E91D0E', // Red
    Democrats: '#232066', // Dark Blue
    Libertarians: '#FFD700', // Gold
    Greens: '#00AA00', // Green
    Independents: '#800080', // Purple
  };

  if (knownParties[partyName]) {
    return knownParties[partyName];
  }

  // For unknown parties, use the pre-generated distinct colors
  return distinctColors[index % distinctColors.length];
};
