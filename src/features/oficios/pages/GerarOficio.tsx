import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Typography,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Stack,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {
    Print as PrintIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import supabase from '../../../utils/supabase';
import { FormularioOficio } from '../components/FormularioOficio';
import { VisualizacaoOficio } from '../components/VisualizacaoOficio';

interface OficioFormData {
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
    utilizado: boolean;
}

export default function GerarOficio() {
    const navigate = useNavigate();
    const hoje = new Date();
    const dataFormatadaPadrao = `${hoje.getDate()} de ${hoje.toLocaleDateString('pt-BR', { month: 'long' })} de ${hoje.getFullYear()}`;

    const [formData, setFormData] = useState<OficioFormData>({
        numero: '',
        ano: hoje.getFullYear().toString(),
        cidade: 'Crateús',
        dataExtenso: dataFormatadaPadrao,
        destinatario: '',
        referencia: '',
        descricaoEvento: '',
        solicitacaoDetalhada: '',
        responsavelNome: 'Edgard Ferreira Bispo de Jesus',
        responsavelCargo: 'Responsável Local',
        utilizado: false,
    });

    const [isSaving, setIsSaving] = useState(false);

    const [isSaved, setIsSaved] = useState(false);
    const [openPrintConfirmDialog, setOpenPrintConfirmDialog] = useState(false);
    const [openLeaveConfirmDialog, setOpenLeaveConfirmDialog] = useState(false);
    const [pendingNavigationUrl, setPendingNavigationUrl] = useState<string | null>(null);

    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Busca próximo número de ofício disponível
    const fetchProximoNumero = async () => {
        try {
            const anoAtual = new Date().getFullYear().toString();

            const { data, error } = await supabase
                .from('oficios')
                .select('numero')
                .eq('ano', anoAtual)
                .order('numero', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            if (data && data.numero) {
                const ultimoNumero = parseInt(data.numero, 10);
                const proximoNumero = (ultimoNumero + 1).toString().padStart(3, '0');

                setFormData((prev) => ({
                    ...prev,
                    numero: proximoNumero,
                    ano: anoAtual
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    numero: '001',
                    ano: anoAtual
                }));
            }
        } catch (err) {
            console.error('Erro ao buscar último número:', err);
        }
    };

    useEffect(() => {
        fetchProximoNumero();
    }, []);

    // Proteção ao fechar/atualizar aba (F5)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isSaved) {
                e.preventDefault();
                e.returnValue = 'Você tem alterações não salvas.';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isSaved]);

    const handleChange = (field: keyof OficioFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsSaved(false);
    };

    // Trata a saída/voltar confirmando caso haja alterações não salvas
    const handleVoltar = (targetPath = '/oficios') => {
        if (!isSaved) {
            setPendingNavigationUrl(targetPath);
            setOpenLeaveConfirmDialog(true);
        } else {
            navigate(targetPath);
        }
    };

    const handleConfirmLeave = () => {
        setOpenLeaveConfirmDialog(false);
        if (pendingNavigationUrl) {
            navigate(pendingNavigationUrl);
        }
    };

    const handleSalvarOficio = async (): Promise<boolean> => {
        setIsSaving(true);
        try {
            const payload = {
                numero: formData.numero,
                ano: Number(formData.ano),
                remetente: "Shalom " + formData.cidade,
                destinatario: formData.destinatario,
                cidade: formData.cidade,
                finalidade: formData.referencia,
                descricao: formData.solicitacaoDetalhada,
                utilizado: formData.utilizado
            };

            const { error } = await supabase.from('oficios').insert([payload]);

            if (error) throw error;

            setIsSaved(true);
            setToast({ open: true, message: 'Ofício salvo no banco com sucesso!', severity: 'success' });

            setTimeout(() => {
                navigate('/oficios');
            }, 1200);

            return true;
        } catch (err) {
            console.error('Erro ao salvar:', err);
            setToast({ open: true, message: 'Erro ao salvar o ofício no banco de dados.', severity: 'error' });
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleImprimirClick = () => {
        if (!isSaved) {
            setOpenPrintConfirmDialog(true);
        } else {
            window.print();
        }
    };

    const handleConfirmSalvarEImprimir = async () => {
        setOpenPrintConfirmDialog(false);
        const salvo = await handleSalvarOficio();
        if (salvo) {
            setTimeout(() => {
                window.print();
            }, 150);
        }
    };

    const handleConfirmApenasImprimir = () => {
        setOpenPrintConfirmDialog(false);
        setTimeout(() => {
            window.print();
        }, 150);
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8', pb: 6 }}>
            {/* CSS de Impressão com Margens Padrão Garantidas */}
            <style>
                {`
                    @media print {
                    /* 1. Limpa fundos do navegador e libera o fluxo */
                    html, body {
                        background-color: #fff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }

                    /* 2. Oculta tudo que não pertence à folha A4 */
                    header, nav, .MuiAppBar-root, .MuiDialog-root, .MuiBackdrop-root, .no-print {
                        display: none !important;
                    }

                    .print-area {
                        margin: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                    }

                    /* 3. Estrutura fluida para o papel A4 no modo impresso */
                    .a4-paper {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 auto !important;
                        padding: 0 !important; /* A margem da página cuidará do espaçamento */
                        width: 100% !important;
                        min-height: auto !important;
                        height: auto !important;
                        background-color: #fff !important;
                    }

                    /* 4. Evita quebras ruins em parágrafos e assinaturas */
                    p, typography {
                        orphans: 3;
                        widows: 3;
                    }

                    .signature-block {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    /* 5. DEFINE MARGENS PADRÃO DE PÁGINA (A4 INSTITUCIONAL) */
                    @page {
                        size: A4 portrait;
                        margin: 20mm 20mm 20mm 20mm; /* Força 2cm de margem padrão em todos os lados */
                    }
                    }
                `}
            </style>

            {/* Topbar Integrada */}
            <Box className="no-print" sx={{ mb: 3 }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    gap={2}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <IconButton color="default" onClick={() => handleVoltar('/oficios')} size="small">
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">
                                Gerador de Ofício
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Shalom Crateús • Padrão Institucional
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={isSaving ? <CircularProgress size={18} /> : <SaveIcon />}
                            onClick={handleSalvarOficio}
                            disabled={isSaving}
                        >
                            Salvar no Banco
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={handleImprimirClick}
                            sx={{ px: 3, fontWeight: 'bold' }}
                        >
                            Imprimir / PDF
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            {/* Conteúdo Principal (2 Colunas) */}
            <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 3 } }}>
                <Grid container spacing={3}>
                    {/* PAINEL ESQUERDO: CONTROLES */}
                    <Grid item xs={12} lg={5} className="no-print">
                        <FormularioOficio
                            formData={formData}
                            handleChange={handleChange}
                        />
                    </Grid>

                    {/* PAINEL DIREITO: FOLHA A4 TIMBRADA */}
                    <Grid item xs={12} lg={7} className="print-area">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <VisualizacaoOficio formData={formData} />
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Modal de Confirmação para Salvar Antes de Imprimir */}
            <Dialog open={openPrintConfirmDialog} onClose={() => setOpenPrintConfirmDialog(false)}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Salvar Ofício no Banco de Dados?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Este ofício ainda não foi registrado no banco de dados. Deseja salvá-lo antes de realizar a impressão?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleConfirmApenasImprimir} color="inherit">
                        Apenas Imprimir
                    </Button>
                    <Button onClick={handleConfirmSalvarEImprimir} variant="contained" color="primary" autoFocus>
                        Salvar e Imprimir
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Confirmação para Sair Sem Salvar */}
            <Dialog open={openLeaveConfirmDialog} onClose={() => setOpenLeaveConfirmDialog(false)}>
                <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    Atenção: Alterações Não Salvas!
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Você possui alterações ou dados não salvos neste ofício. Se sair agora, essas informações serão perdidas. Deseja realmente sair?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setOpenLeaveConfirmDialog(false)} variant="outlined" color="inherit">
                        Continuar Editando
                    </Button>
                    <Button onClick={handleConfirmLeave} variant="contained" color="error">
                        Sair Sem Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar Toast */}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={() => setToast((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}