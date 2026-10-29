import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Divider,
  Stack,
  Grid,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  EventNote as EventIcon
} from '@mui/icons-material';

interface OficioData {
  numero: string;
  ano: string;
  cidade: string;
  dataExtenso: string;
  destinatario: string;
  referencia: string;
  descricaoEvento: string;
  solicitacaoDetalhada: string;
  responsavelNome: string;
  responsavelCargo: string;
}

interface FormularioOficioProps {
  formData: OficioData;
  handleChange: (field: keyof OficioData, value: string) => void;
}

export const FormularioOficio: React.FC<FormularioOficioProps> = ({
  formData,
  handleChange,
}) => {
  return (
    <Stack spacing={2.5}>
      {/* Dados Gerais */}
      <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="primary" mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DescriptionIcon fontSize="small" /> Dados Gerais
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <TextField fullWidth disabled label="Nº Ofício" size="small" value={formData.numero} onChange={(e) => handleChange('numero', e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth disabled label="Ano" size="small" value={formData.ano} onChange={(e) => handleChange('ano', e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Cidade" size="small" value={formData.cidade} onChange={(e) => handleChange('cidade', e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Data Extenso" size="small" value={formData.dataExtenso} onChange={(e) => handleChange('dataExtenso', e.target.value)} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" color="primary" mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon fontSize="small" /> Destinatário & Ref.
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <TextField fullWidth label="Destinatário (Órgão / Pessoa)" size="small" value={formData.destinatario} onChange={(e) => handleChange('destinatario', e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Referência / Evento" size="small" value={formData.referencia} onChange={(e) => handleChange('referencia', e.target.value)} />
          </Grid>
        </Grid>
      </Paper>

      {/* Conteúdo Variável */}
      <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="primary" mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon fontSize="small" /> Detalhes da Solicitação
        </Typography>
        <Stack spacing={1.5}>
          <TextField
            fullWidth
            label="Parágrafo 1: Descrição do Evento e Objetivo"
            size="small"
            multiline
            rows={3}
            value={formData.descricaoEvento}
            onChange={(e) => handleChange('descricaoEvento', e.target.value)}
          />
          <TextField
            fullWidth
            label="Parágrafo 2: Pedido / Solicitação Detalhada"
            size="small"
            multiline
            rows={3}
            value={formData.solicitacaoDetalhada}
            onChange={(e) => handleChange('solicitacaoDetalhada', e.target.value)}
          />
        </Stack>
      </Paper>

      {/* Assinatura */}
      <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="primary" mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="small" /> Assinatura
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <TextField fullWidth label="Nome Responsável" size="small" value={formData.responsavelNome} onChange={(e) => handleChange('responsavelNome', e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Cargo" size="small" value={formData.responsavelCargo} onChange={(e) => handleChange('responsavelCargo', e.target.value)} />
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
};