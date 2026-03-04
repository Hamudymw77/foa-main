import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Match, MatchEvent, MatchGoal } from '@/types';

// Helper function to read JSON file
const readJsonFile = (filePath: string) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
};

// Helper function to write JSON file
const writeJsonFile = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, event, status } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    const upcomingPath = path.join(process.cwd(), 'app', 'upcoming.json');
    const standingsPath = path.join(process.cwd(), 'app', 'standings.json');

    let matches = readJsonFile(upcomingPath);
    let matchFound = false;
    let filePathToUpdate = upcomingPath;

    if (!matches || !Array.isArray(matches)) {
      matches = [];
    }

    let matchIndex = matches.findIndex((m: any) => m.id === matchId);

    // If not found in upcoming.json, try standings.json
    if (matchIndex === -1) {
      const standingsMatches = readJsonFile(standingsPath);
      if (standingsMatches && Array.isArray(standingsMatches)) {
        const standingsMatchIndex = standingsMatches.findIndex((m: any) => m.id === matchId);
        if (standingsMatchIndex !== -1) {
          matches = standingsMatches;
          matchIndex = standingsMatchIndex;
          filePathToUpdate = standingsPath;
        }
      }
    }

    if (matchIndex === -1) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const match = matches[matchIndex];

    // Update status if provided
    if (status) {
      match.status = status;
    }

    // Process event if provided
    if (event) {
      if (!match.events) {
        match.events = [];
      }
      match.events.push(event);

      // Specific logic for goal events
      if (event.type === 'goal') {
        if (!match.goals) {
          match.goals = [];
        }

        // Update scores
        if (event.team === 'home') {
          match.homeScore = (match.homeScore || 0) + 1;
        } else if (event.team === 'away') {
          match.awayScore = (match.awayScore || 0) + 1;
        }

        // Create goal object
        const newGoal: MatchGoal = {
          minute: event.minute,
          team: event.team,
          scorer: event.player || 'Unknown',
          score: `${match.homeScore || 0}-${match.awayScore || 0}`,
          assist: event.assist
        };

        match.goals.push(newGoal);
      }
    }

    // Save updated data
    const success = writeJsonFile(filePathToUpdate, matches);

    if (!success) {
      return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      match: match,
      message: 'Match updated successfully' 
    });

  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
