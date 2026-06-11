import React from 'react';
import { TableRow, TableCell, Chip, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { OficioItem } from '../../types';
import supabase from '../../../../utils/supabase';

interface OficioTableRowProps {
    oficio: OficioItem;
    onEdit: (id: number) => void;
}

const OficioTableRow: React.FC<OficioTableRowProps> = ({ oficio, onEdit }) => {
    
    const handleViewPdf = async () => {
        if (!oficio.arquivo_url) {
            alert("Este ofício não possui arquivo de PDF anexo.");
            return;
        }

        try {
            const { data } = supabase.storage
                .from('oficios')
                .getPublicUrl(oficio.arquivo_url);

            if (!data || !data.publicUrl) {
                alert("Não foi possível gerar o link de acesso ao arquivo.");
                return;
            }

            // Adiciona o Cache Buster (?t=timestamp) para enganar o cache do navegador e da CDN
            const urlComCacheBuster = `${data.publicUrl}?t=${Date.now()}`;

            // Valida usando a URL modificada
            const response = await fetch(urlComCacheBuster, { method: 'HEAD' });
            
            if (response.ok) {
                window.open(urlComCacheBuster, '_blank');
            } else {
                alert(
                    "Política de Armazenamento: Para garantir o espaço e uso dos serviços gratuitos, " +
                    "este arquivo está temporariamente indisponível no sistema. " +
                    "Se desejar acessar o arquivo físico, consulte a comunicação da secretaria."
                );
            }
        } catch (error) {
            console.error("Erro ao validar arquivo:", error);
            alert("Ocorreu um erro ao tentar acessar o arquivo anexado.");
        }
    };

    return (
        <TableRow
            hover
            sx={{
                '&:nth-of-type(odd)': {
                    backgroundColor: '#f9f9f9',
                },
                '&:last-child td, &:last-child th': {
                    borderBottom: 0
                },
                '&:hover': {
                    backgroundColor: '#f1f8fe',
                }
            }}
        >
            <TableCell
                sx={{
                    color: '#1976d2',
                    fontWeight: 'bold',
                    borderRight: '1px solid #e0e0e0',
                    width: '80px',
                    textAlign: 'center'
                }}
            >
                {String(oficio.numero).padStart(2, '0')}
            </TableCell>
            <TableCell
                sx={{
                    borderRight: '1px solid #e0e0e0',
                    width: '80px',
                    textAlign: 'center',
                    color: '#1976d2',
                    fontWeight: 'bold'
                }}
            >
                {oficio.ano}
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                {oficio.remetente}
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                {oficio.destinatario}
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                {oficio.finalidade || '-'}
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                {oficio.cidade}
            </TableCell>
            <TableCell
                sx={{
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid #e0e0e0'
                }}
            >
                {oficio.descricao}
            </TableCell>
            <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                <Chip
                    label={oficio.utilizado ? "Utilizado" : "Não Utilizado"}
                    sx={{
                        backgroundColor: oficio.utilizado ? "#4caf50" : "#9e9e9e",
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        height: '24px'
                    }}
                />
            </TableCell>            
            <TableCell>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton
                        color="secondary"
                        onClick={handleViewPdf}
                        disabled={!oficio.arquivo_url}
                        size="small"
                        sx={{
                            backgroundColor: oficio.arquivo_url ? 'rgba(156, 39, 176, 0.08)' : 'rgba(0, 0, 0, 0.03)',
                            '&:hover': {
                                backgroundColor: 'rgba(156, 39, 176, 0.15)',
                            }
                        }}
                    >
                        <PictureAsPdfIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                        color="primary"
                        onClick={() => onEdit(oficio.id)}
                        size="small"
                        sx={{
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.15)',
                            }
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Box>
            </TableCell>
        </TableRow>
    );
};

export default OficioTableRow;