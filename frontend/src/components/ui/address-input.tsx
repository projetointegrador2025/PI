import { useState } from "react";
import { Input } from "./input";

export interface Address {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  complement: string;
}

export const emptyAddress: Address = {
  cep: "",
  street: "",
  neighborhood: "",
  city: "",
  state: "",
  number: "",
  complement: "",
};

function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, "$1-$2");
}

interface AddressInputProps {
  value: Address;
  onChange: (address: Address) => void;
  error?: string;
}

export function AddressInput({ value, onChange, error }: AddressInputProps) {
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  const fetchCEP = async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepError("CEP deve ter 8 dígitos");
      return;
    }

    setCepLoading(true);
    setCepError("");

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado");
        onChange({ ...value, street: "", neighborhood: "", city: "", state: "" });
        return;
      }

      onChange({
        ...value,
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      });
    } catch {
      setCepError("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (rawValue: string) => {
    const masked = maskCEP(rawValue);
    onChange({ ...value, cep: masked });
    setCepError("");

    const digits = masked.replace(/\D/g, "");
    if (digits.length === 8) {
      fetchCEP(digits);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="CEP *"
          value={value.cep}
          onChange={(e) => handleCepChange(e.target.value)}
          placeholder="00000-000"
          error={cepError || error}
          disabled={cepLoading}
        />
        <Input
          label="Rua"
          value={value.street}
          readOnly
          className="bg-muted/50"
        />
        <Input
          label="Número *"
          value={value.number}
          onChange={(e) => onChange({ ...value, number: e.target.value })}
          placeholder="123"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Input
          label="Bairro"
          value={value.neighborhood}
          readOnly
          className="bg-muted/50"
        />
        <Input
          label="Cidade"
          value={value.city}
          readOnly
          className="bg-muted/50"
        />
        <Input
          label="Estado"
          value={value.state}
          readOnly
          className="bg-muted/50"
        />
        <Input
          label="Complemento"
          value={value.complement}
          onChange={(e) => onChange({ ...value, complement: e.target.value })}
          placeholder="Apto, Bloco..."
        />
      </div>
      {cepLoading && <p className="text-xs text-muted-foreground">Buscando CEP...</p>}
    </div>
  );
}

export function formatAddress(addr: Address): string {
  if (!addr.cep) return "";
  const parts = [
    addr.street,
    addr.number ? `nº ${addr.number}` : "",
    addr.complement,
    addr.neighborhood,
    addr.city && addr.state ? `${addr.city}/${addr.state}` : addr.city || addr.state,
    addr.cep,
  ].filter(Boolean);
  return parts.join(", ");
}
