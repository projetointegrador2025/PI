import { useState, useCallback } from "react";
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
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

interface AddressInputProps {
  value: Address;
  onChange: (address: Address) => void;
  error?: string;
}

export function AddressInput({ value, onChange, error }: AddressInputProps) {
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  const fetchCEP = useCallback(async (digits: string, currentValue: Address) => {
    setCepLoading(true);
    setCepError("");

    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado");
        onChange({ ...currentValue, cep: maskCEP(digits), street: "", neighborhood: "", city: "", state: "" });
        return;
      }

      onChange({
        ...currentValue,
        cep: maskCEP(digits),
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
  }, [onChange]);

  const handleCepChange = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 8);
    const masked = maskCEP(digits);
    setCepError("");

    if (digits.length === 0) {
      // CEP apagado: limpar todos os campos de endereço
      onChange({ ...value, cep: "", street: "", neighborhood: "", city: "", state: "" });
      return;
    }

    if (digits.length < 8) {
      // CEP incompleto: limpar campos preenchidos automaticamente
      onChange({ ...value, cep: masked, street: "", neighborhood: "", city: "", state: "" });
      return;
    }

    // CEP completo (8 dígitos): buscar endereço
    const updatedValue = { ...value, cep: masked };
    onChange(updatedValue);
    fetchCEP(digits, updatedValue);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="CEP *"
          value={value.cep}
          onChange={(e) => handleCepChange(e.target.value)}
          placeholder="00000-000"
          maxLength={9}
          error={cepError || error}
          disabled={cepLoading}
          autoComplete="off"
        />
        <Input
          label="Rua"
          value={value.street}
          readOnly
          className="bg-muted/50"
          autoComplete="off"
        />
        <Input
          label="Número *"
          value={value.number}
          onChange={(e) => onChange({ ...value, number: e.target.value })}
          placeholder="123"
          autoComplete="off"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Input
          label="Bairro"
          value={value.neighborhood}
          readOnly
          className="bg-muted/50"
          autoComplete="off"
        />
        <Input
          label="Cidade"
          value={value.city}
          readOnly
          className="bg-muted/50"
          autoComplete="off"
        />
        <Input
          label="Estado"
          value={value.state}
          readOnly
          className="bg-muted/50"
          autoComplete="off"
        />
        <Input
          label="Complemento"
          value={value.complement}
          onChange={(e) => onChange({ ...value, complement: e.target.value })}
          placeholder="Apto, Bloco..."
          autoComplete="off"
        />
      </div>
      {cepLoading && <p className="text-xs text-muted-foreground">Buscando CEP...</p>}
    </div>
  );
}

export function formatAddress(addr: Address): string {
  if (!addr.street) return "";
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
