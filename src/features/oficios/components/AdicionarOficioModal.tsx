import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Checkbox,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { OficioItem } from '../types';
import supabase from '../../../utils/supabase';

interface AdicionarOficioModalProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

const AdicionarOficioModal: React.FC<AdicionarOficioModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [visible, setVisible] = useState(false);
  const currentYear = new Date().getFullYear();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    ano: currentYear.toString(),
    remetente: '',
    destinatario: '',
    cidade: 'Crateús',
    descricao: '',
    utilizado: false,
  });

  useEffect(() => {
    if (open !== undefined) {
      setVisible(open);
    }
  }, [open]);

  const handleOpen = () => setVisible(true);

  const handleClose = () => {
    resetForm();
    setVisible(false);
    if (onClose) onClose();
  };

  const resetForm = () => {
    setFormData({
      ano: currentYear.toString(),
      remetente: '',
      destinatario: '',
      cidade: 'Crateús',
      descricao: '',
      utilizado: false,
    });
    setError(null);
  };

  const handleChange =
    (field: string) =>
      (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
        const value = event.target.value;
        setFormData({ ...formData, [field]: value });
      };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, utilizado: event.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Nome correto no seu arquivo original
    setError(null);

    const payload = {
      ano: Number(formData.ano),
      remetente: formData.remetente,
      destinatario: formData.destinatario,
      cidade: formData.cidade,
      descricao: formData.descricao,
      utilizado: formData.utilizado,
    };

    try {
      const { data, error: funcError } = await supabase.functions.invoke('add_oficio', {
        body: payload,
      });

      if (funcError) throw funcError;

      setSuccess(true);
      onSuccess?.();
      // Fechar o modal após sucesso
      setTimeout(() => {
        onClose?.();
      }, 2000);

    } catch (err: any) {
      console.error("Erro:", err);
      setError(err.message || "Erro ao criar ofício");
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => setSuccess(false);

  const cidadesOptions = ['Crateús', 'Nova Russas', 'Ipueiras'];

  if (open === undefined) {
    return (
      <>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Adicionar Ofício
        </Button>

        <Dialog open={visible} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>Adicionar Novo Ofício</DialogTitle>
          <DialogContent>{renderForm()}</DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : null}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={success}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity="success">
            Ofício adicionado com sucesso!
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Dialog open={visible} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Adicionar Novo Ofício</DialogTitle>
        <DialogContent>{renderForm()}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : null}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Ofício adicionado com sucesso!
        </Alert>
      </Snackbar>
    </>
  );

  // 🔸 Renderização do formulário
  function renderForm() {
    return (
      <Box sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="Ano" value={formData.ano} disabled fullWidth required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Remetente"
              value={formData.remetente}
              onChange={handleChange('remetente')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Destinatário"
              value={formData.destinatario}
              onChange={handleChange('destinatario')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="cidade-label">Cidade</InputLabel>
              <Select
                labelId="cidade-label"
                value={formData.cidade}
                onChange={
                  handleChange('cidade') as unknown as (event: SelectChangeEvent) => void
                }
                label="Cidade"
              >
                {cidadesOptions.map((cidade) => (
                  <MenuItem key={cidade} value={cidade}>
                    {cidade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={handleChange('descricao')}
              fullWidth
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.utilizado}
                  onChange={handleCheckboxChange}
                  color="primary"
                />
              }
              label="Ofício Utilizado"
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
};

export default AdicionarOficioModal;
