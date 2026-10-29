import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

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

interface VisualizacaoOficioProps {
  formData: OficioData;
}

export const VisualizacaoOficio: React.FC<VisualizacaoOficioProps> = ({ formData }) => {
  return (
    <Paper
      elevation={3}
      className="a4-paper"
      sx={{
        width: '210mm',
        minHeight: '297mm',
        padding: { xs: '15mm', sm: '20mm' },
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        fontFamily: '"Times New Roman", Times, serif',
        color: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        mx: 'auto'
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        {/* Cabeçalho Oficial */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            component="img"
            src="/logo_shalom.png"
            alt="Comunidade Católica Shalom"
            sx={{
              height: 30,
              maxWidth: '100%',
              objectFit: 'contain',
              mx: 'auto',
              mb: 1.5,
              display: 'block'
            }}
          />
          <Typography sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: '12px', fontWeight: '500', color: '#000', mb: 0.2 }}>
            Comunidade Católica Shalom
          </Typography>
          <Typography sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: '12px', color: '#000', mb: 0.2 }}>
            CNPJ: 07.044.456/0043-51
          </Typography>
          <Typography sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: '12px', color: '#000', mb: 0.2 }}>
            Rua Firmino Rosa, 801
          </Typography>
          <Typography sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: '12px', color: '#000', mb: 0.2 }}>
            Telefone: 88 9 96816943
          </Typography>
          <Typography sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: '12px', color: '#000' }}>
            E-mail: economatocrateus@comshalom.org
          </Typography>
        </Box>

        {/* Identificação do Documento */}
        <Box sx={{ mb: 3, lineHeight: 1.5, fontSize: '13px' }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 0.5 }}>
            Ofício nº {formData.numero}/{formData.ano}
          </Typography>
          <Typography sx={{ fontWeight: 'bold', fontSize: '13px' }}>
            À {formData.destinatario || '[Destinatário]'}
          </Typography>
          <Typography sx={{ fontSize: '13px', mb: 1 }}>
            <strong>Ref.</strong> {formData.referencia || '[Evento / Assunto]'}
          </Typography>
          <Typography sx={{ textAlign: 'right', fontSize: '13px', fontStyle: 'italic', mt: 1 }}>
            {formData.cidade}, {formData.dataExtenso}.
          </Typography>
        </Box>

        {/* Corpo do Texto */}
        <Box sx={{ textAlign: 'justify', lineHeight: 1.6, fontSize: '13px' }}>
          <Typography paragraph sx={{ mb: 2 }}>
            A Comunidade Católica Shalom Crateús, Associação sem fins lucrativos, inscrita no CNPJ Nº 07.044.456/0043-51, registrada no MDS sob o N° 189/2001, e no CMAS sob o Nº 005, com endereço à Rua Firmino Rosa, 801, bairro Centro nesta cidade, vem respeitosamente à presença de Vossa Senhoria comunicar que estaremos realizando {formData.descricaoEvento || '[Descrição do evento e objetivo]'}.
          </Typography>

          <Typography paragraph sx={{ mb: 2 }}>
            Diante disso, solicitamos de Vossa Senhoria {formData.solicitacaoDetalhada || '[Pedido / Solicitação Detalhada]'}.
          </Typography>

          <Typography paragraph sx={{ mb: 3 }}>
            Certos de podermos contar com a atenção e colaboração de Vossa Senhoria, agradecemos desde já e nos colocamos à disposição para quaisquer esclarecimentos que se fizerem necessários.
          </Typography>
        </Box>
      </Box>

      {/* Bloco de Assinatura (Protegido contra quebras ruins) */}
      <Box className="signature-block" sx={{ pt: 4, mt: 'auto' }}>
        <Typography sx={{ fontSize: '13px', mb: 6, textAlign: 'left' }}>
          Respeitosamente,
        </Typography>

        <Box sx={{ width: '60%', mx: 'auto', textAlign: 'center' }}>
          <Box sx={{ borderTop: '1px solid #000', mb: 1 }} />
          <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>
            {formData.responsavelNome}
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#333' }}>
            {formData.responsavelCargo}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};