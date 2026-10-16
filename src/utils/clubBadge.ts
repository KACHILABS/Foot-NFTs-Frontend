import { CLUBS } from '../../constants';

interface ClubLike {
  name?: string;
  shortName?: string;
  tla?: string;
  crest?: string;
  logo?: string;
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss').replace(/ø/g, 'o')
    .replace(/đ/g, 'd').replace(/ł/g, 'l')
    .replace(/æ/g, 'ae').replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]/gi, '')
    .replace(/^(fc|afc|sc|cf|af|ac|as)/, '');

export const findClubBadge = (names: string[]): string | undefined => {
  const tries = names.map(normalize).filter(name => name.length > 1);
  for (const club of CLUBS) {
    const clubName = normalize(club.name);
    if (tries.some(name => name === clubName)) return club.badge;
  }
  for (const club of CLUBS) {
    const clubName = normalize(club.name);
    if (clubName.length > 4 && tries.some(name => name.length > 4 && (name.includes(clubName) || clubName.includes(name)))) {
      return club.badge;
    }
  }
  return undefined;
};

export const resolveClubBadge = (team: ClubLike | undefined): string | undefined => {
  if (!team) return undefined;
  return findClubBadge([team.name || '', team.shortName || '', team.tla || ''])
    || team.crest
    || team.logo
    || undefined;
};
