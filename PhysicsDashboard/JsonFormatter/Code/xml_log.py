{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": 3,
   "metadata": {},
   "outputs": [
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "Requirement already satisfied: beautifulsoup4 in c:\\users\\beatr\\appdata\\local\\packages\\pythonsoftwarefoundation.python.3.11_qbz5n2kfra8p0\\localcache\\local-packages\\python311\\site-packages (4.12.3)\n",
      "Requirement already satisfied: soupsieve>1.2 in c:\\users\\beatr\\appdata\\local\\packages\\pythonsoftwarefoundation.python.3.11_qbz5n2kfra8p0\\localcache\\local-packages\\python311\\site-packages (from beautifulsoup4) (2.5)\n",
      "Note: you may need to restart the kernel to use updated packages.\n",
      "Requirement already satisfied: lxml in c:\\users\\beatr\\appdata\\local\\packages\\pythonsoftwarefoundation.python.3.11_qbz5n2kfra8p0\\localcache\\local-packages\\python311\\site-packages (5.1.0)\n",
      "Note: you may need to restart the kernel to use updated packages.\n",
      "Requirement already satisfied: simplejson in c:\\users\\beatr\\appdata\\local\\packages\\pythonsoftwarefoundation.python.3.11_qbz5n2kfra8p0\\localcache\\local-packages\\python311\\site-packages (3.19.2)\n",
      "Note: you may need to restart the kernel to use updated packages.\n"
     ]
    },
    {
     "data": {
      "text/plain": [
       "{'body_region': 'HEAD', 'gender': 'FEMALE'}"
      ]
     },
     "execution_count": 3,
     "metadata": {},
     "output_type": "execute_result"
    }
   ],
   "source": [
    "\n",
    "%pip install beautifulsoup4\n",
    "%pip install lxml\n",
    "%pip install simplejson\n",
    "\n",
    "\n",
    "import json\n",
    "\n",
    "def xml_log(input_name):\n",
    "    from bs4 import BeautifulSoup\n",
    "    with open(input_name, 'r') as f:\n",
    "        data = f.read()\n",
    "    Bs_data = BeautifulSoup(data, \"xml\")\n",
    "    b_body_region = Bs_data.find('m_sBodyPartExamined')\n",
    "    b_female = Bs_data.find('m_bFemale')\n",
    "    if b_female==False:\n",
    "        b_female=\"MALE\"\n",
    "    else:\n",
    "        b_female=\"FEMALE\"\n",
    "\n",
    "    dictionary = {\n",
    "    \"body_region\": b_body_region.next,\n",
    "    \"gender\": b_female }\n",
    "\n",
    "    json_object = json.dumps(dictionary, indent=2)\n",
    "    output_name= input_name.replace('.xml', '.json')\n",
    "    with open(output_name, \"w\") as outfile:\n",
    "        outfile.write(json_object)\n",
    "\n",
    "    return ('file created')\n",
    "\n",
    "#CHANGE HERE name of file\n",
    "xml_log(\"log.xml\")"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.11.8"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 2
}
