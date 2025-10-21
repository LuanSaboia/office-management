import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Snackbar,
  TextField,
  CircularProgress,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { OficioItem } from '../types';
import supabase from '../../../utils/supabase';

interface EditarOficioModalProps {
  open?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  oficioId?: number;
  oficioData?: OficioItem;
}

const EditarOficioModal: React.FC<EditarOficioModalProps> = ({
  open,
  onClose,
  onSuccess,
  oficioId,
  oficioData,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    ano: '',
    remetente: '',
    destinatario: '',
    cidade: '',
    descricao: '',
    utilizado: false,
  });

  // Atualiza o estado interno quando o modal abre
  useEffect(() => {
    if (open !== undefined) {
      setVisible(open);
      if (open && oficioData) {
        setFormData({
          ano: oficioData.ano?.toString() || '',
          remetente: oficioData.remetente || '',
          destinatario: oficioData.destinatario || '',
          cidade: oficioData.cidade || '',
          descricao: oficioData.descricao || '',
          utilizado: oficioData.utilizado || false,
        });
      }
    }
  }, [open, oficioData]);

  const handleClose = () => {
    setVisible(false);
    setError(null);
    if (onClose) onClose();
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

  // 🟢 Atualização direta no Supabase
  const handleSubmit = async () => {
    try {
      if (!oficioId) {
        setError('ID do ofício não fornecido.');
        return;
      }

      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('oficios')
        .update({
          remetente: formData.remetente,
          destinatario: formData.destinatario,
          cidade: formData.cidade,
          descricao: formData.descricao,
          utilizado: formData.utilizado,
        })
        .eq('id', oficioId);

      if (updateError) throw updateError;

      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Erro ao atualizar ofício:', err);
      if (err instanceof Error) {
        setError(`Não foi possível atualizar o ofício: ${err.message}`);
      } else {
        setError('Não foi possível atualizar o ofício. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleErrorClose = () => setError(null);

  return (
    <>
      <Dialog open={visible} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0',
            pb: 2,
          }}
        >
          Editar Ofício
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
          >
            <TextField label="Ano" value={formData.ano} disabled fullWidth />
            <TextField
              label="Remetente"
              value={formData.remetente}
              onChange={handleChange('remetente')}
              fullWidth
            />
            <TextField
              label="Destinatário"
              value={formData.destinatario}
              onChange={handleChange('destinatario')}
              fullWidth
            />
            <TextField
              label="Cidade"
              value={formData.cidade}
              onChange={handleChange('cidade')}
              fullWidth
            />
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={handleChange('descricao')}
              fullWidth
              multiline
              rows={3}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.utilizado}
                  onChange={handleCheckboxChange}
                  name="utilizado"
                />
              }
              label="Utilizado"
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ p: 2, pt: 1, borderTop: '1px solid #e0e0e0' }}
        >
          <Button onClick={handleClose}>CANCELAR</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : null}
          >
            {loading ? 'SALVANDO...' : 'SALVAR'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditarOficioModal;
