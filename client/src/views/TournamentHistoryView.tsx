import { TournamentType } from '@labrute/prisma';
import { Box, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, useMediaQuery, useTheme } from '@mui/material';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import Page from '../components/Page';
import Text from '../components/Text';
import useStateAsync from '../hooks/useStateAsync';
import Server from '../utils/Server';
import Link from '../components/Link';

const TournamentHistoryView = () => {
  const { t } = useTranslation();
  const { bruteName } = useParams();
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.down('md'));

  const { data: tournaments } = useStateAsync(null, Server.Tournament.getHistory, bruteName || '');

  return tournaments && (
    <Page title={`${bruteName || ''} ${t('MyBrute')}`} headerUrl={`/${bruteName || ''}/cell`}>
      <Paper sx={{ mx: 4 }}>
        <Text h3 bold upperCase typo="handwritten" sx={{ mr: 2 }}>{t('tournamentHistory')}</Text>
      </Paper>
      <Paper sx={{ bgcolor: 'background.paperLight', mt: -2 }}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={3} />
          <Grid item xs={12} md={6}>
            <Table sx={{
              maxWidth: 1,
              '& th': {
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                py: 0.5,
                px: 1,
                fontWeight: 'bold',
                border: '1px solid',
                borderColor: 'background.default',
              },
              '& td': {
                bgcolor: 'background.paperDark',
                py: 0.5,
                px: 1,
                border: '1px solid',
                borderColor: 'background.default',
              },
            }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>{t('date')}</TableCell>
                  <TableCell align="right">{t('tournament')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow
                    key={tournament.id}
                  >
                    <TableCell component="th" scope="row">
                      {moment.utc(tournament.date).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell align="right">
                      <Link to={`/${bruteName || ''}/tournament/${tournament.type === TournamentType.GLOBAL ? 'global/' : ''}${moment.utc(tournament.date).format('YYYY-MM-DD')}`}>
                        <Text bold>
                          {tournament.type === TournamentType.DAILY
                            ? t('dailyTournament')
                            : tournament.type === TournamentType.GLOBAL
                              ? t('globalTournament')
                              : tournament.type}
                        </Text>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
          {!isMd && (
            <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box component="img" src="/images/arena/referee.gif" sx={{ maxWidth: 1 }} />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Page>
  );
};

export default TournamentHistoryView;
